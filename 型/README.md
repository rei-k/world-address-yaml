🚚 配送実務レベル（届くレベル）型
name:                     # 国名
  en: string              # 英語名（必須）

iso_codes:
  alpha2: string          # ISO 3166-1 alpha-2（必須）

languages:                # 配送ラベルで使う言語
  - name: string          # 言語名
    script: string        # 書記体系（例: Latin, Arabic）
    direction: string     # ltr / rtl
    role: string          # official / auxiliary / shipping_required

address_format:           # 住所フォーマット
  order:                  # フィールドの並び順（国際配送用推奨）
    - recipient
    - street_address
    - city
    - province
    - postal_code
    - country

  recipient:
    required: boolean
  street_address:
    required: boolean
  city:
    required: boolean
  province:
    required: boolean
    label_en: string      # 英語ラベル（例: Province, Prefecture）
  postal_code:
    required: boolean
    regex: string         # 郵便番号パターン
  country:
    required: boolean

examples:
  international: string   # 国際配送ラベルの例

📚 研究レベル（学術・比較用）型
name:                     # 国名（多言語対応）
  en: string              # 英語名
  local:                  # 現地名（複数可）
    - lang: string        # 言語名
      value: string       # 現地表記
      script: string      # 書記体系
      direction: string   # ltr / rtl

iso_codes:                # ISO 規格コード
  alpha2: string
  alpha3: string
  numeric: string

continent: string         # 大陸（例: Asia）
subregion: string         # サブリージョン（例: South Asia）

languages:                # 住所に対応する言語
  - name: string
    script: string
    direction: string
    role: string          # official / auxiliary
    required_for_shipping: boolean
    country_name: string  # 国名の現地表記

address_format:
  order_variants:         # 書式のバリエーション
    - context: string     # domestic / international / postal
      order:
        - recipient
        - building
        - floor
        - room
        - unit
        - street_address
        - district
        - city
        - province
        - postal_code
        - country

  recipient:
    required: boolean
  building:
    required: boolean
    example: string
  floor:
    required: boolean
    example: string
  room:
    required: boolean
    example: string
  unit:
    required: boolean
    example: string
  street_address:
    required: boolean
    example: string
  district:
    required: boolean
    example: string
  city:
    required: boolean
    example: string
  province:
    required: boolean
    type: string          # Province / State / Prefecture
    label_local: string   # 現地ラベル
    label_en: string      # 英語ラベル
    count: integer
  postal_code:
    required: boolean
    regex: string
    description: string
    example: string
    since: integer
  country:
    required: boolean
    value: string

administrative_divisions: # 行政区画
  level1:
    type: string
    label_local: string
    label_en: string
    count: integer
  level2:
    type: string
    required: boolean
  level3:
    type: string
    required: boolean

validation:               # 入力バリデーション
  allow_latin_transliteration: boolean
  postal_code_rules:
    general: string       # required / optional
    exceptions: string
  fallback: string        # 郵便番号なし時の代替

examples:                 # 住所例
  domestic_raw: string         # 現地そのまま
  domestic_normalized: string  # 正規化後
  international: string        # 国際配送用