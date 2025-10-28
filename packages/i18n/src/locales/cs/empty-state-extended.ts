export default {
  project_empty_state: {
    epics: {
      title: "Přeměňte složité projekty na strukturované epiky.",
      description: "Epik vám pomůže organizovat velké cíle do menších, sledovatelných úkolů.",
      cta_primary: "Vytvořit epik",
      cta_secondary: "Dokumentace",
    },
    epic_work_items: {
      title: "K tomuto epiku jste ještě nepřidali pracovní položky.",
      description: "Začněte přidáním některých pracovních položek k tomuto epiku a sledujte je zde.",
      cta_secondary: "Přidat pracovní položky",
    },
  },
  workspace_empty_state: {
    home_widget_stickies: {
      title: "Poznamenejte si nápad, zachyťte aha moment nebo zaznamenejte náhlý nápad. Přidejte poznámku a začněte.",
    },
    stickies: {
      title: "Poznamenejte si nápad, zachyťte aha moment nebo zaznamenejte náhlý nápad. Přidejte poznámku a začněte.",
      cta_primary: "Přidat poznámku",
    },
    active_cycles: {
      title: "Žádné aktivní cykly",
      description: "Momentálně nemáte žádné probíhající cykly. Aktivní cykly se zde zobrazí, když budou zahrnovat dnešní datum.",
    },
    teamspaces: {
      title: "S týmovými prostory odemkněte lepší organizaci a sledování",
      description: "Vytvořte vyhrazený prostor pro každý skutečný tým, oddělený od všech ostatních pracovních povrchů v Plane, a přizpůsobte je tomu, jak váš tým pracuje.",
      cta_primary: "Vytvořit nový týmový prostor",
    },
    initiatives: {
      title: "Sledujte projekty a epiky z jednoho místa",
      description: "Použijte iniciativy ke seskupení a sledování souvisejících projektů a epiků. Zobrazujte pokrok, priority a výsledky—vše z jediné obrazovky.",
      cta_primary: "Vytvořit iniciativu",
    },
    customers: {
      title: "Spravujte práci podle toho, co je důležité pro vaše zákazníky",
      description: "Propojte požadavky zákazníků s pracovními položkami, přiřaďte prioritu podle požadavků a shrňte stavy pracovních položek do záznamů zákazníků. Brzy se budete moci integrovat s vaším CRM nebo nástrojem podpory pro ještě lepší správu práce podle atributů zákazníků.",
      cta_primary: "Vytvořit záznam zákazníka",
    },
    dashboard: {
      title: "Vizualizujte svůj pokrok pomocí přehledů",
      description: "Vytvářejte přizpůsobitelné přehledy pro sledování metrik, měření výsledků a efektivní prezentaci poznatků.",
      cta_primary: "Vytvořit nový přehled",
    },
    wiki: {
      title: "Napište poznámku, dokument nebo celou znalostní bázi.",
      description: "Stránky jsou prostorem pro zachycení myšlenek v Plane. Pořizujte poznámky ze schůzek, snadno je formátujte, vkládejte pracovní položky, uspořádejte je pomocí knihovny komponent a udržujte vše v kontextu vašeho projektu.",
      cta_primary: "Vytvořte svou stránku",
    },
  },
  settings_empty_state: {
    teamspace: {
      title: "Zatím žádný týmový prostor",
      description: "Spojte své členy v týmovém prostoru pro sledování pokroku, pracovní zátěže a aktivity - bez námahy. Zjistit více",
      cta_primary: "Přidat týmový prostor",
    },
    work_item_types: {
      title: "Vytvářejte a přizpůsobujte typy pracovních položek",
      description: "Definujte jedinečné typy pracovních položek pro váš projekt. Každý typ může mít své vlastní vlastnosti, pracovní postupy a pole - přizpůsobené potřebám vašeho projektu a týmu.",
      cta_primary: "Povolit",
    },
    work_item_type_properties: {
      title: "Definujte vlastnost a podrobnosti, které chcete zachytit pro tento typ pracovní položky. Přizpůsobte jej pracovnímu postupu vašeho projektu.",
      cta_secondary: "Přidat vlastnost",
    },
    epic_setting: {
      title: "Povolit epiky",
      description: "Seskupte související pracovní položky do větších celků, které se rozprostírají přes více cyklů a modulů - ideální pro sledování celkového pokroku.",
      cta_primary: "Povolit",
    },
    templates: {
      title: "Zatím žádné šablony",
      description: "Zkraťte dobu nastavení vytvářením šablon pro pracovní položky a stránky — a začněte novou práci během několika sekund.",
      cta_primary: "Vytvořte svou první šablonu",
    },
    recurring_work_items: {
      title: "Zatím žádná opakující se pracovní položka",
      description: "Nastavte opakující se pracovní položky pro automatizaci opakujících se úkolů a snadné dodržování harmonogramu.",
      cta_primary: "Vytvořit opakující se pracovní položku",
    },
    worklogs: {
      title: "Sledujte časové výkazy pro všechny členy",
      description: "Zaznamenávejte čas na pracovních položkách pro zobrazení podrobných časových výkazů pro jakéhokoli člena týmu napříč projekty.",
    },
    customers_setting: {
      title: "Povolte správu zákazníků pro začátek.",
      cta_primary: "Povolit",
    },
    template_setting: {
      title: "Zatím žádné šablony",
      description: "Zkraťte dobu nastavení vytvářením šablon pro projekty, pracovní položky a stránky — a začněte novou práci během několika sekund.",
      cta_primary: "Vytvořit šablonu",
    },
    webhooks: {
      title: "Zatím nebyl přidán žádný Webhook",
      description: "Automatizujte oznámení externím službám při výskytu událostí projektu.",
      cta_primary: "Přidat webhook",
    },
  },
} as const;
