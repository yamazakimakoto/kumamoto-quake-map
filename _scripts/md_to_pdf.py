#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""データ管理表.md を Claude Code ファイルビューア風のスタイルで HTML 化し、
Chrome のヘッドレス印刷で PDF を出力する。

usage: python3 md_to_pdf.py <input.md> <output.pdf> [--portrait]
"""
import re
import subprocess
import sys
from pathlib import Path

import markdown

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS = """
@page { size: A4 %(orient)s; margin: 14mm 12mm 16mm 12mm; }
* { box-sizing: border-box; }
body{
  font-family: "Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic",
               -apple-system,"Helvetica Neue",Arial,sans-serif;
  color:#1f2023; font-size:9.4pt; line-height:1.62;
  -webkit-font-smoothing:antialiased; margin:0;
}
h1{ font-size:19pt; font-weight:700; letter-spacing:.01em; margin:0 0 14px; color:#111114; }
h2{ font-size:12.6pt; font-weight:700; margin:22px 0 9px; color:#111114;
    page-break-after:avoid; break-after:avoid; }
p{ margin:6px 0; }
a{ color:#1a6bd8; text-decoration:none; word-break:break-all; }
strong{ font-weight:700; color:#000; }
code{ font-family:"SF Mono",Menlo,Consolas,monospace; font-size:.88em;
      background:#f1f1ef; border-radius:4px; padding:1px 5px; color:#3a3a3c; }
hr{ border:0; border-top:1px solid #e6e6e3; margin:20px 0; }
blockquote{
  margin:12px 0; padding:9px 13px; background:#f6f6f4;
  border:1px solid #eaeae6; border-radius:8px; color:#4a4a4d; font-size:9pt;
}
blockquote p{ margin:0; }
table{
  border-collapse:separate; border-spacing:0; width:100%%; margin:9px 0 4px;
  border:1px solid #e4e4e0; border-radius:8px; overflow:hidden;
  font-size:8.6pt; page-break-inside:auto;
}
thead{ display:table-header-group; }
tr{ page-break-inside:avoid; break-inside:avoid; }
th{
  background:#f6f6f4; font-weight:700; color:#2a2a2d; text-align:left;
  padding:6px 8px; border-bottom:1px solid #e4e4e0; white-space:nowrap;
}
td{ padding:5px 8px; border-bottom:1px solid #efefec; vertical-align:top; }
tbody tr:last-child td{ border-bottom:0; }
th+th, td+td{ border-left:1px solid #f0f0ed; }
td[align="right"], th[align="right"]{ text-align:right; }
td.nw, th{ white-space:nowrap; }
tr.total-row td{ background:#f4f4f1; }
.docmeta{ font-size:9pt; color:#55555a; margin:0 0 12px; line-height:1.85; }
.footer-note{ font-size:8.4pt; color:#66666b; margin-top:6px; }
.pdfhead{
  display:flex; justify-content:space-between; align-items:baseline;
  border-bottom:1px solid #ececE8; padding-bottom:7px; margin-bottom:16px;
  font-size:8.4pt; color:#7a7a80;
}
"""


def build_html(md_path: Path, orient: str) -> str:
    raw = md_path.read_text(encoding="utf-8")

    # 先頭の H1 とメタ行（**キー**：値 の連続）を分離して整形する
    lines = raw.split("\n")
    title = lines[0].lstrip("# ").strip()
    body_md = "\n".join(lines[1:]).lstrip("\n")

    meta_lines = []
    while body_md.startswith("**"):
        head, _, rest = body_md.partition("\n")
        if not head.startswith("**"):
            break
        meta_lines.append(head)
        body_md = rest
    meta_html = markdown.markdown("  \n".join(meta_lines)) if meta_lines else ""

    html_body = markdown.markdown(
        body_md,
        extensions=["tables", "sane_lists", "nl2br"],
    )
    # markdown拡張が付ける style="text-align: right" を align属性に寄せる（CSSで統一）
    html_body = re.sub(r'\s*style="text-align:\s*right;?"', ' align="right"', html_body)
    html_body = re.sub(r'\s*style="text-align:\s*left;?"', "", html_body)

    # 短いセル（時点・出典・状態など）は折り返さない
    def _nowrap(m):
        cell, inner = m.group(0), m.group(2)
        text = re.sub(r"<[^>]+>", "", inner)
        return cell.replace("<td", '<td class="nw"', 1) if len(text) <= 10 else cell

    html_body = re.sub(r"<td([^>]*)>(.*?)</td>", _nowrap, html_body, flags=re.S)

    # 合計行にクラスを付ける
    html_body = re.sub(
        r"<tr>(?=(?:(?!</tr>).)*合計)", '<tr class="total-row">', html_body, flags=re.S
    )

    # 末尾の作成者クレジットを小さく
    html_body = html_body.replace(
        "<p>作成・管理：", '<p class="footer-note">作成・管理：'
    ).replace("<p>※本表の被害情報", '<p class="footer-note">※本表の被害情報')

    return f"""<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><title>{title}</title>
<style>{CSS % {"orient": orient}}</style></head>
<body>
<div class="pdfhead"><span>ひとつの党 AI仮想内閣／山崎誠政策研究所</span>
<span>令和8年熊本地震 被災状況マップ</span></div>
<h1>{title}</h1>
<div class="docmeta">{meta_html}</div>
{html_body}
</body></html>"""


def main() -> None:
    src = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    orient = "portrait" if "--portrait" in sys.argv else "landscape"

    # 中間HTMLは _scripts/_build/ に置く（gis直下＝公開リポジトリを汚さない）
    build_dir = Path(__file__).resolve().parent / "_build"
    build_dir.mkdir(exist_ok=True)
    html_path = build_dir / (out.stem + ".html")
    html_path.write_text(build_html(src, orient), encoding="utf-8")

    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
         f"--print-to-pdf={out}", html_path.as_uri()],
        check=True, capture_output=True,
    )
    print(f"OK: {out}  ({out.stat().st_size/1024:.0f} KB)")


if __name__ == "__main__":
    main()
