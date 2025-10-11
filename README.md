# 🗣️ Simple Chatbot

このプロジェクトは、**Hugging Face API** を利用したシンプルなチャットボットアプリケーションです。  
以下の技術を用いて構成されています：

- **フロントエンド**：React (JavaScript)
- **バックエンド**：Go
- **その他**：`local` ブランチでは、ELK Stack（Elasticsearch, Logstash, Kibana）によるログ収集・可視化を導入しています。

---

## 📁 プロジェクト構成

simple-chatbot/
├── backend/ # Go製のAPIサーバー
├── frontend/ # React製のチャットUI
├── logstash/ # logstash設定ファイル等(localのみ)
├── .env # Hugging FaceのAPIキーを含む環境変数ファイル（自分で作成）
├── .env_sample # 環境変数ファイルのサンプル
├── Makefile # build,up,downなど一般的なdocker-composeを提供
└── README.md # このファイル


---

## ✅ 必要要件

- Hugging Face アカウントとAPIキー
- （※ `local` ブランチを使用する場合）Docker および Docker Compose


---

## 🚀 セットアップ手順

### 1. 環境変数の設定

ルートディレクトリに `.env` ファイルを作成し、[`.env_sample`](./.env_sample) を参考に **Hugging FaceのAPIキー** を記述してください。

HUGGINGFACE_API_KEY=your_huggingface_api_key_here

また、フロントエンドのURL、FRONTEND_URLと、バックエンドのURL、REACT_APP_API_URLをそれぞれ設定してください。

(localブランチでlogstashを使う場合は、LOGSTASH_HOSTおよびLOGSTASH_PORTも設定してください)

### 2. 起動

makeでbuild upして起動できます。

## 📊 ログ収集（local ブランチのみ）

local ブランチでは、ELK Stack を利用したログ収集・可視化が可能です。

git checkout local
docker-compose up

Kibana：http://localhost:5601
Elasticsearch：http://localhost:9200

設定ファイルやログ構成の詳細については、local ブランチ内の logstash/ ディレクトリを参照してください。


