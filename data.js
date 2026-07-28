// ============================================================
// 令和8年熊本地震 被災状況マップ データファイル
// 更新方法は README_運用手順.md 参照。
// 各項目の status: "official"=公的機関発表で確認 / "media"=報道（複数社）で確認
//                  "media1"=報道（単一）/ "unverified"=SNS等・未確認
// 必須: name, lat, lng, desc, status, src(出典), asof(時点)
// ============================================================
const LAST_UPDATED = "2026-07-29 12:00";  // ←手動更新のたびに書き換え

// ---- L1b 地震（フォールバック：気象庁API取得失敗時に表示） ----
const DATA_QUAKE_FALLBACK = [
  {name:"本震", lat:32.6, lng:130.7, mag:"7.1", maxi:"7", depth:"約10km",
   desc:"7/28 16:27頃・熊本県熊本地方・横ずれ断層型", status:"official",
   src:"気象庁", asof:"7/28 17:30"},
];

// ---- L2 被害状況（報道・SNS収集） ----
const DATA_DAMAGE = [
  {name:"イオンモール熊本（嘉島町）", lat:32.744, lng:130.753,
   desc:"爆発が発生。20〜30人が安否不明との情報。第42即応機動連隊等が救助活動中",
   status:"media", src:"日経・NHK・防衛省会見", asof:"7/28夜"},
  {name:"日本製紙 八代工場", lat:32.514, lng:130.615,
   desc:"複数の安否不明者の情報", status:"media1", src:"報道", asof:"7/28夜"},
  {name:"八代市内", lat:32.507, lng:130.590,
   desc:"1名の死亡を確認", status:"media", src:"熊本日日新聞", asof:"7/28夜"},
  {name:"氷川町中心部", lat:32.581, lng:130.660,
   desc:"家屋5〜6棟倒壊確認・60人以上病院搬送", status:"media", src:"NHK・熊本日日新聞", asof:"7/28夜"},
  {name:"宇城市", lat:32.646, lng:130.690,
   desc:"複数の家屋倒壊", status:"media1", src:"報道", asof:"7/28夜"},
  {name:"熊本城", lat:32.806, lng:130.706,
   desc:"被害を確認（詳細調査中）", status:"media1", src:"報道", asof:"7/28夜"},
  // 例：SNS由来の未確認情報は status:"unverified" で掲載（グレー表示・要現地確認）
  // {name:"○○地区で土砂崩れ？", lat:32.60, lng:130.75, desc:"X投稿・写真1件のみ・現地未確認",
  //  status:"unverified", src:"X（@---）", asof:"7/29"},
];

// ---- L3 避難所（開設状況） ----
// 熊本県・各市町村の公表リストから追記する（README参照）。数値未公表のため現時点は主要拠点のみ。
const DATA_SHELTERS = [
  {name:"宇城市（拠点避難所・開設中）", lat:32.649, lng:130.684,
   desc:"市内指定避難所を開設中。箇所数・詳細は市公表待ち", status:"media1",
   src:"自治体発表・報道", asof:"7/29"},
  {name:"氷川町（拠点避難所・開設中）", lat:32.583, lng:130.671,
   desc:"町内避難所開設。断水下のためトイレ・給水支援が優先課題", status:"media1",
   src:"自治体発表・報道", asof:"7/29"},
  {name:"八代市（拠点避難所・開設中）", lat:32.505, lng:130.601,
   desc:"市内指定避難所を開設中", status:"media1", src:"自治体発表・報道", asof:"7/29"},
  {name:"益城町（拠点避難所・開設中）", lat:32.791, lng:130.812,
   desc:"2016年被災経験自治体。開設状況の詳細は公表待ち", status:"media1", src:"報道", asof:"7/29"},
];

// ---- L4 避難者数（自治体バブル：count人） ----
// 県災害対策本部の集計公表後に count を入れる。未公表は count:null（「集計待ち」表示）
const DATA_EVACUEES = [
  {name:"宇城市", lat:32.646, lng:130.684, count:null, status:"official", src:"県本部集計待ち", asof:"7/29"},
  {name:"氷川町", lat:32.581, lng:130.673, count:null, status:"official", src:"県本部集計待ち", asof:"7/29"},
  {name:"八代市", lat:32.507, lng:130.601, count:null, status:"official", src:"県本部集計待ち", asof:"7/29"},
  {name:"熊本市", lat:32.803, lng:130.708, count:null, status:"official", src:"県本部集計待ち", asof:"7/29"},
];

// ---- L5 医療機関（中規模以上・医療提供状況） ----
// func: "open"=受入中(確認・緑) / "limited"=機能低下(確認・橙) / "closed"=機能停止(確認・赤) / "unknown"=確認中(灰)
const DATA_MEDICAL = [
  {name:"済生会熊本病院（熊本市南区）", lat:32.766, lng:130.678, func:"open",
   desc:"【受入中・多数対応】84人を手当て（うち少なくとも1人意識不明）。救急受入れ継続中（7/28 22時時点）",
   status:"media", src:"NHK・報道", asof:"7/28 22:00"},
  {name:"八代北部地域医療センター（氷川町）", lat:32.585, lng:130.675, func:"open",
   desc:"【受入中】震度7の地元で約80人を手当て中", status:"media", src:"報道", asof:"7/28夜"},
  {name:"熊本総合病院（八代市）", lat:32.503, lng:130.600, func:"limited",
   desc:"【機能低下】設備損傷により停電・断水。救急搬送の問合せ相次ぐも全例は受入れ不可",
   status:"media", src:"熊本日日新聞", asof:"7/28 19:00"},
  {name:"桜十字系 八代病院（八代市）※名称確認中", lat:32.515, lng:130.605, func:"closed",
   desc:"【機能停止】停電・断水で診療機能が停止。職員複数が負傷との報道",
   status:"media1", src:"熊本日日新聞（英訳経由・正式名称確認中）", asof:"7/28 19:00"},
  {name:"熊本労災病院（八代市）", lat:32.492, lng:130.622, func:"unknown",
   desc:"【確認中】震度6強圏の基幹病院。建物・受入状況の公表待ち", status:"unverified", src:"未確認", asof:"7/29"},
  {name:"熊本大学病院（熊本市中央区）", lat:32.786, lng:130.687, func:"unknown",
   desc:"【確認中】災害拠点病院（基幹）。震度5強圏・稼働とみられるが公式確認待ち", status:"media1", src:"位置=公知・状況未確認", asof:"7/29"},
  {name:"熊本赤十字病院（熊本市東区）", lat:32.818, lng:130.752, func:"unknown",
   desc:"【確認中】災害拠点病院。震度5強圏・稼働とみられるが公式確認待ち", status:"media1", src:"位置=公知・状況未確認", asof:"7/29"},
  {name:"国立病院機構 熊本医療センター（熊本市中央区）", lat:32.800, lng:130.700, func:"unknown",
   desc:"【確認中】災害拠点病院。受入状況の公表待ち", status:"media1", src:"位置=公知・状況未確認", asof:"7/29"},
  {name:"熊本市民病院（熊本市東区）", lat:32.775, lng:130.745, func:"unknown",
   desc:"【確認中】2016年被災→再建済の市立基幹病院。状況公表待ち", status:"media1", src:"位置=公知・状況未確認", asof:"7/29"},
  {name:"熊本中央病院（熊本市南区）", lat:32.740, lng:130.690, func:"unknown",
   desc:"【確認中】震度6強圏（南区）の中核病院。状況公表待ち", status:"unverified", src:"未確認", asof:"7/29"},
];

// ---- L6 道路・交通 ----
// type:"line"=通行止め等の区間（path=概略経路・IC位置ベース）／type:"point"=地点情報
const DATA_TRANSPORT = [
  {type:"line", name:"九州自動車道 通行止め（植木IC〜栗野IC）",
   path:[[32.884,130.723],[32.835,130.792],[32.788,130.807],[32.712,130.772],
         [32.642,130.700],[32.513,130.633],[32.216,130.759],[32.048,130.812],[31.985,130.756]],
   desc:"上下線で通行止め（7/28 16:30頃〜）。複数箇所で段差・ひび割れ。解除見通し立たず（第1報時点）。経路は概略",
   status:"official", src:"NEXCO西日本 第1報・報道", asof:"7/28 19:43"},
  {type:"line", name:"南九州自動車道 通行止め（八代JCT〜日奈久IC）",
   path:[[32.503,130.602],[32.443,130.617]],
   desc:"上下線で通行止め。経路は概略", status:"official", src:"NEXCO西日本 第1報", asof:"7/28 19:43"},
  {type:"line", name:"九州中央自動車道 通行止め（嘉島JCT〜益城）",
   path:[[32.723,130.775],[32.770,130.828]],
   desc:"嘉島JCT〜益城料金所 上下線で通行止め。経路は概略", status:"official", src:"NEXCO西日本 第1報", asof:"7/28 19:43"},
  {type:"line", name:"九州新幹線（博多〜鹿児島中央）終日運転見合わせ",
   path:[[32.837,130.689],[32.790,130.689],[32.737,130.688],[32.640,130.660],[32.512,130.601]],
   desc:"全線で終日運転見合わせ。新幹線などで13人けが。線路上停止列車から乗客180人を誘導（表示は県内区間の概略）",
   status:"media", src:"JR九州・日経・TBS", asof:"7/28"},
  {type:"point", name:"八代市内 道路高架", lat:32.512, lng:130.612,
   desc:"高架道路に被害か（空撮映像）。詳細調査中", status:"media1", src:"NHK空撮", asof:"7/28"},
  {type:"point", name:"JR在来線", lat:32.790, lng:130.689,
   desc:"JR九州全線一時停止→安全確認できた区間から順次再開。熊本エリアは点検継続", status:"media", src:"JR九州・報道", asof:"7/28夜"},
  {type:"point", name:"西九州新幹線（武雄温泉〜長崎）", lat:33.194, lng:130.019,
   desc:"18時までに全線運転再開", status:"media", src:"報道", asof:"7/28 18:00"},
  {type:"point", name:"阿蘇くまもと空港", lat:32.837, lng:130.855,
   desc:"運航状況は確認中（公式発表の確認待ち）", status:"unverified", src:"未確認", asof:"7/29"},
];

// ---- L7 電気（停電） ----
const DATA_POWER = [
  {name:"熊本県内 停電", lat:32.68, lng:130.68, radius:20000,
   desc:"約4万8,170戸が停電（ピーク時）。電源車を病院・避難所・浄水場へ重点配備",
   status:"media", src:"九州電力発表・報道", asof:"7/28夜"},
];

// ---- L8 ガス ----
const DATA_GAS = [
  {name:"都市ガス供給停止（熊本地区）", lat:32.76, lng:130.70, radius:9000,
   desc:"安全確認のため供給停止。ブロック単位で点検→順次再開見込み",
   status:"media", src:"事業者発表・報道", asof:"7/28夜"},
];

// ---- L9 水道（断水） ----
const DATA_WATER = [
  {name:"氷川町 断水", lat:32.581, lng:130.673, radius:5000,
   desc:"1万戸以上が断水。給水車を展開", status:"media", src:"県・報道", asof:"7/28夜"},
  {name:"広域断水（宇城・八代方面）", lat:32.58, lng:130.63, radius:12000,
   desc:"広範囲で断水報告。復旧工程は事業体公表待ち", status:"media1", src:"報道", asof:"7/29"},
];

// ---- L10 医療支援チーム（DMAT等の展開） ----
const DATA_MEDTEAM = [
  {name:"DMAT活動拠点本部（想定：県庁）", lat:32.790, lng:130.742,
   desc:"DMAT参集・活動中。展開先詳細はEMIS/公表待ち", status:"media1", src:"報道", asof:"7/29"},
];

// ---- L11 行政・警察・消防・自衛隊の配置 ----
// kind: "gov"=行政庁舎🏛 / "sdf"=自衛隊🪖 / "police"=警察👮 / "fire"=常備消防🚒 / "dan"=消防団🧯 / "nat"=国の機関🏢
// 庁舎・署所の位置はすべて概略。
const DATA_ADMIN = [
  // --- 国・県 ---
  {kind:"nat", name:"政府 非常災害対策本部（官邸）", lat:32.792, lng:130.744,
   desc:"7/28 19:45設置（本部長：内閣総理大臣）※表示位置は現地連絡側＝県庁",
   status:"official", src:"首相官邸", asof:"7/28"},
  {kind:"gov", name:"熊本県 災害対策本部（県庁）", lat:32.790, lng:130.742,
   desc:"県対策本部設置・自衛隊派遣要請（17:30）", status:"official", src:"県・防衛省", asof:"7/28"},
  {kind:"nat", name:"内閣府 調査チーム（被災地）", lat:32.650, lng:130.705,
   desc:"政府調査チームを派遣", status:"official", src:"官邸", asof:"7/28"},
  // --- 市町村災害対策本部（庁舎） ---
  {kind:"gov", name:"熊本市 災害対策本部（市役所）", lat:32.803, lng:130.708,
   desc:"市域で震度6強〜5強。本部設置とみられる（公表確認中）", status:"media1", src:"通例運用・確認中", asof:"7/29"},
  {kind:"gov", name:"宇城市 災害対策本部（市役所）", lat:32.646, lng:130.684,
   desc:"震度7。市対策本部で応急対応中", status:"media1", src:"報道・確認中", asof:"7/29"},
  {kind:"gov", name:"氷川町 災害対策本部（役場）", lat:32.581, lng:130.673,
   desc:"震度7。断水1万戸超・倒壊対応中", status:"media1", src:"報道・確認中", asof:"7/29"},
  {kind:"gov", name:"八代市 災害対策本部（市役所）", lat:32.507, lng:130.601,
   desc:"震度6強。死者1名・市内被害多数への対応中", status:"media1", src:"報道・確認中", asof:"7/29"},
  {kind:"gov", name:"宇土市 災害対策本部（市役所）", lat:32.687, lng:130.658,
   desc:"震度6強", status:"media1", src:"確認中", asof:"7/29"},
  {kind:"gov", name:"美里町 災害対策本部（役場）", lat:32.636, lng:130.797,
   desc:"震度6強", status:"media1", src:"確認中", asof:"7/29"},
  {kind:"gov", name:"益城町 災害対策本部（役場）", lat:32.791, lng:130.812,
   desc:"震度6強。2016年被災経験自治体", status:"media1", src:"確認中", asof:"7/29"},
  {kind:"gov", name:"嘉島町 災害対策本部（役場）", lat:32.744, lng:130.753,
   desc:"イオンモール熊本の事故対応・救助支援", status:"media1", src:"報道・確認中", asof:"7/29"},
  // --- 自衛隊 ---
  {kind:"sdf", name:"陸自 第8師団（北熊本駐屯地）", lat:32.870, lng:130.727,
   desc:"災害派遣の中核。約3,600人活動・航空機20機・連絡員派遣", status:"official", src:"防衛省会見", asof:"7/28"},
  {kind:"sdf", name:"陸自 西部方面総監部（健軍駐屯地）", lat:32.786, lng:130.760,
   desc:"方面隊レベルの統制。増援・予備自招集の調整拠点（運用詳細は発表待ち）", status:"media1", src:"公知の所在・運用確認中", asof:"7/29"},
  {kind:"sdf", name:"陸自 八代駐屯地", lat:32.462, lng:130.628,
   desc:"震度6強圏の最寄り駐屯地。第42即応機動連隊等がイオンモール熊本で救助活動", status:"official", src:"防衛省会見", asof:"7/28"},
  // --- 警察 ---
  {kind:"police", name:"熊本県警察本部", lat:32.790, lng:130.740,
   desc:"災害警備本部を設置とみられる（公表確認中）。交通規制・安否不明者対応", status:"media1", src:"通例運用・確認中", asof:"7/29"},
  {kind:"police", name:"宇城警察署", lat:32.648, lng:130.690,
   desc:"震度7地域を管轄（宇城市・美里町等）。救助・交通規制", status:"media1", src:"位置=公知・活動詳細確認中", asof:"7/29"},
  {kind:"police", name:"八代警察署", lat:32.505, lng:130.605,
   desc:"震度6強〜7地域を管轄（八代市・氷川町）", status:"media1", src:"位置=公知・活動詳細確認中", asof:"7/29"},
  {kind:"police", name:"熊本南警察署", lat:32.742, lng:130.672,
   desc:"震度6強の熊本市南区を管轄", status:"media1", src:"位置=公知・活動詳細確認中", asof:"7/29"},
  {kind:"police", name:"御船警察署", lat:32.712, lng:130.800,
   desc:"上益城郡（益城町・嘉島町等）を管轄。イオンモール事故対応", status:"media1", src:"位置=公知・活動詳細確認中", asof:"7/29"},
  {kind:"police", name:"警察 広域緊急援助隊", lat:32.700, lng:130.650,
   desc:"他県からの応援部隊。派遣規模・展開先は発表確認待ち", status:"unverified", src:"発表待ち", asof:"7/29"},
  // --- 常備消防 ---
  {kind:"fire", name:"熊本市消防局", lat:32.794, lng:130.710,
   desc:"市域＋近隣受託区域の消火・救助・救急。イオンモール等へ出動とみられる", status:"media1", src:"位置=公知・確認中", asof:"7/29"},
  {kind:"fire", name:"宇城広域連合消防本部", lat:32.642, lng:130.688,
   desc:"宇城市・宇土市・美里町等を管轄。震度7地域の救助最前線", status:"media1", src:"位置=公知・確認中", asof:"7/29"},
  {kind:"fire", name:"八代広域行政事務組合消防本部", lat:32.510, lng:130.603,
   desc:"八代市・氷川町を管轄。倒壊家屋救助・工場事案対応", status:"media1", src:"位置=公知・確認中", asof:"7/29"},
  {kind:"fire", name:"上益城消防組合消防本部", lat:32.720, lng:130.770,
   desc:"益城町・嘉島町等を管轄。イオンモール熊本の救助・消火対応", status:"media1", src:"位置=公知・確認中", asof:"7/29"},
  {kind:"fire", name:"緊急消防援助隊（応援部隊）", lat:32.610, lng:130.720,
   desc:"他県消防の応援部隊。出動規模・活動場所は消防庁発表の確認待ち", status:"unverified", src:"発表待ち", asof:"7/29"},
  // --- 消防団 ---
  {kind:"dan", name:"宇城市消防団", lat:32.640, lng:130.678,
   desc:"地元密着の救助・安否確認・夜間警戒。活動詳細は市の集約待ち（拠点表示は市役所付近）", status:"unverified", src:"詳細確認待ち", asof:"7/29"},
  {kind:"dan", name:"氷川町消防団", lat:32.577, lng:130.670,
   desc:"倒壊家屋周辺の警戒・初期救助。詳細は町の集約待ち", status:"unverified", src:"詳細確認待ち", asof:"7/29"},
  {kind:"dan", name:"八代市消防団", lat:32.503, lng:130.598,
   desc:"市内各分団が警戒・巡回。詳細は市の集約待ち", status:"unverified", src:"詳細確認待ち", asof:"7/29"},
  {kind:"dan", name:"益城町消防団", lat:32.788, lng:130.815,
   desc:"2016年の教訓を持つ団。活動詳細は町の集約待ち", status:"unverified", src:"詳細確認待ち", asof:"7/29"},
];

// ---- L13 熱中症・暑熱対策 ----
// WBGT実況・熱中症警戒アラートは環境省「熱中症予防情報サイト」を毎朝確認して更新（README参照）
const DATA_HEAT = [
  {name:"暑熱リスク（被災地全域）", lat:32.66, lng:130.70, radius:26000, circle:true,
   desc:"7月末の酷暑期の発災。停電・断水下でエアコン/水分が制約され熱中症リスク大。アラート発表状況は環境省サイトで毎朝確認→本項を更新",
   status:"official", src:"環境省 熱中症予防情報サイト（要日次確認）", asof:"7/29"},
  {name:"冷房確保室（クールルーム）設置状況", lat:32.649, lng:130.690,
   desc:"仮想内閣目標：48時間で拠点避難所100%。設置済み避難所をここに追記していく（現在：設置状況の集約待ち）",
   status:"unverified", src:"県・市町村の公表待ち", asof:"7/29"},
  {name:"クーリングシェルター（指定暑熱避難施設）", lat:32.803, lng:130.708,
   desc:"熊本市等が指定する暑熱避難施設。停電地区の在宅避難者の日中クールシェア先として開放を調整（施設リストは市HPで確認・追記）",
   status:"media1", src:"各市町村HP（要確認・追記）", asof:"7/29"},
];

// ---- L12 ボランティア活動拠点 ----
// 災害VCは社協が開設判断。開設発表後に追記（README参照）
const DATA_VOLUNTEER = [
  {name:"災害ボランティアセンター（開設検討中）", lat:32.646, lng:130.660,
   desc:"各市町村社協が開設準備・検討中。募集開始前の現地入りは控えてください",
   status:"unverified", src:"開設発表待ち", asof:"7/29"},
];
