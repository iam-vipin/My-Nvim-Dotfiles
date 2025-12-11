export default {
  project_empty_state: {
    epics: {
      title: "將複雜專案轉化為結構化史詩。",
      description: "史詩幫助您將大目標組織成更小的可追蹤任務。",
      cta_primary: "建立史詩",
      cta_secondary: "文件",
    },
    epic_work_items: {
      title: "您尚未向此史詩新增工作項。",
      description: "開始向此史詩新增一些工作項並在此處追蹤它們。",
      cta_secondary: "新增工作項",
    },
  },
  workspace_empty_state: {
    home_widget_stickies: {
      title: "記下想法、捕捉靈光一現或記錄思維火花。新增便籤開始。",
    },
    stickies: {
      title: "記下想法、捕捉靈光一現或記錄思維火花。新增便籤開始。",
      cta_primary: "新增便籤",
    },
    active_cycles: {
      title: "無活躍週期",
      description: "您目前沒有任何正在進行的週期。包含今天日期的活躍週期將顯示在此處。",
    },
    teamspaces: {
      title: "使用團隊空間解鎖更好的組織和追蹤",
      description:
        "為每個真實世界的團隊建立專用空間,與 Plane 中的所有其他工作空間分離,並自訂它們以適應您的團隊工作方式。",
      cta_primary: "建立新的團隊空間",
    },
    initiatives: {
      title: "從一個地方追蹤專案和史詩",
      description: "使用計劃對相關專案和史詩進行分組和監控。檢視進度、優先順序和成果 — 全部來自單個螢幕。",
      cta_primary: "建立計劃",
    },
    customers: {
      title: "按對客戶重要的內容管理工作",
      description:
        "將客戶請求與工作項關聯,按請求分配優先順序,並將工作項狀態彙總到客戶記錄中。很快,您將能夠與您的 CRM 或支援工具整合,以便按客戶屬性進行更好的工作管理。",
      cta_primary: "建立客戶記錄",
    },
    dashboard: {
      title: "使用儀表板視覺化您的進度",
      description: "建構可自訂的儀表板以追蹤指標、衡量成果並有效呈現見解。",
      cta_primary: "建立新儀表板",
    },
    wiki: {
      title: "撰寫筆記、文件或完整的知識庫。",
      description:
        "頁面是 Plane 中的思想捕捉空間。記錄會議筆記,輕鬆格式化,嵌入工作項,使用元件庫進行配置,並將它們全部保留在專案上下文中。",
      cta_primary: "建立您的頁面",
    },
  },
  settings_empty_state: {
    teamspace: {
      title: "暫無團隊空間",
      description: "在團隊空間中聚集成員,輕鬆追蹤進度、工作量和活動。瞭解更多",
      cta_primary: "新增團隊空間",
    },
    work_item_types: {
      title: "建立和自訂工作項類型",
      description:
        "為專案定義獨特的工作項類型。每種類型都可以有自己的屬性、工作流程和欄位 — 根據專案和團隊需求量身訂製。",
      cta_primary: "啟用",
    },
    work_item_type_properties: {
      title: "定義要為此工作項類型擷取的屬性和詳細資訊。自訂它以符合專案的工作流程。",
      cta_secondary: "新增屬性",
    },
    epic_setting: {
      title: "啟用史詩",
      description: "將相關工作項分組到跨越多個週期和模組的更大主體中 — 非常適合追蹤全域進度。",
      cta_primary: "啟用",
    },
    templates: {
      title: "暫無範本",
      description: "透過為工作項和頁面建立範本來減少設定時間 — 並在幾秒鐘內開始新工作。",
      cta_primary: "建立您的第一個範本",
    },
    recurring_work_items: {
      title: "暫無循環工作項",
      description: "設定循環工作項以自動化重複任務並輕鬆保持計劃進度。",
      cta_primary: "建立循環工作項",
    },
    worklogs: {
      title: "追蹤所有成員的工時表",
      description: "在工作項上記錄時間以檢視跨專案任何團隊成員的詳細工時表。",
    },
    customers_setting: {
      title: "啟用客戶管理以開始。",
      cta_primary: "啟用",
    },
    template_setting: {
      title: "暫無範本",
      description: "透過為專案、工作項和頁面建立範本來減少設定時間 — 並在幾秒鐘內開始新工作。",
      cta_primary: "建立範本",
    },
  },
} as const;
