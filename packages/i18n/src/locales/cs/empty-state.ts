/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

export default {
  common_empty_state: {
    progress: {
      title: "Zatím nejsou k dispozici žádné metriky pokroku.",
      description: "Začněte nastavovat hodnoty vlastností v pracovních položkách, abyste zde viděli metriky pokroku.",
    },
    updates: {
      title: "Zatím žádné aktualizace.",
      description: "Jakmile členové projektu přidají aktualizace, zobrazí se zde",
    },
    search: {
      title: "Žádné odpovídající výsledky.",
      description: "Nebyly nalezeny žádné výsledky. Zkuste upravit vyhledávací výrazy.",
    },
    not_found: {
      title: "Jejda! Něco se zdá být v nepořádku",
      description: "Momentálně se nám nedaří načíst váš účet plane. Může se jednat o chybu sítě.",
      cta_primary: "Zkuste znovu načíst",
    },
    server_error: {
      title: "Chyba serveru",
      description: "Nemůžeme se připojit a načíst data z našeho serveru. Nebojte se, pracujeme na tom.",
      cta_primary: "Zkuste znovu načíst",
    },
  },
  project_empty_state: {
    no_access: {
      title: "Vypadá to, že nemáte přístup k tomuto projektu",
      restricted_description: "Kontaktujte administrátora a požádejte o přístup, abyste zde mohli pokračovat.",
      join_description: "Klikněte na tlačítko níže pro připojení k projektu.",
      cta_primary: "Připojit se k projektu",
      cta_loading: "Připojování k projektu",
    },
    invalid_project: {
      title: "Projekt nebyl nalezen",
      description: "Projekt, který hledáte, neexistuje.",
    },
    work_items: {
      title: "Začněte s vaší první pracovní položkou.",
      description:
        "Pracovní položky jsou stavebními kameny vašeho projektu — přiřazujte vlastníky, nastavujte priority a snadno sledujte pokrok.",
      cta_primary: "Vytvořte svou první pracovní položku",
    },
    cycles: {
      title: "Seskupujte a časově omezte svou práci v cyklech.",
      description:
        "Rozdělte práci do časově omezených bloků, pracujte zpětně od termínu projektu pro nastavení dat a dosahujte hmatatelného pokroku jako tým.",
      cta_primary: "Nastavte svůj první cyklus",
    },
    cycle_work_items: {
      title: "V tomto cyklu nejsou žádné pracovní položky k zobrazení",
      description:
        "Vytvořte pracovní položky pro zahájení sledování pokroku vašeho týmu v tomto cyklu a dosažení vašich cílů včas.",
      cta_primary: "Vytvořit pracovní položku",
      cta_secondary: "Přidat existující pracovní položku",
    },
    modules: {
      title: "Namapujte cíle vašeho projektu na moduly a snadno sledujte.",
      description:
        "Moduly se skládají z propojených pracovních položek. Pomáhají sledovat pokrok prostřednictvím fází projektu, z nichž každá má specifické termíny a analytiku, která ukazuje, jak blízko jste dosažení těchto fází.",
      cta_primary: "Nastavte svůj první modul",
    },
    module_work_items: {
      title: "V tomto modulu nejsou žádné pracovní položky k zobrazení",
      description: "Vytvořte pracovní položky pro zahájení sledování tohoto modulu.",
      cta_primary: "Vytvořit pracovní položku",
      cta_secondary: "Přidat existující pracovní položku",
    },
    views: {
      title: "Uložte vlastní pohledy pro váš projekt",
      description:
        "Pohledy jsou uložené filtry, které vám pomáhají rychle přistupovat k informacím, které používáte nejčastěji. Spolupracujte bez námahy, zatímco spolupracovníci sdílejí a přizpůsobují pohledy svým specifickým potřebám.",
      cta_primary: "Vytvořit pohled",
    },
    no_work_items_in_project: {
      title: "V projektu zatím nejsou žádné pracovní položky",
      description:
        "Přidejte pracovní položky do svého projektu a rozdělte svou práci na sledovatelné části pomocí pohledů.",
      cta_primary: "Přidat pracovní položku",
    },
    work_item_filter: {
      title: "Nebyly nalezeny žádné pracovní položky",
      description: "Váš aktuální filtr nevrátil žádné výsledky. Zkuste změnit filtry.",
      cta_primary: "Přidat pracovní položku",
    },
    pages: {
      title: "Dokumentujte vše — od poznámek po PRD",
      description:
        "Stránky vám umožňují zachytit a organizovat informace na jednom místě. Pište poznámky ze schůzek, projektovou dokumentaci a PRD, vkládejte pracovní položky a strukturujte je pomocí připravených komponent.",
      cta_primary: "Vytvořte svou první stránku",
    },
    archive_pages: {
      title: "Zatím žádné archivované stránky",
      description: "Archivujte stránky, které nejsou na vašem radaru. Přistupte k nim zde, když budete potřebovat.",
    },
    intake_sidebar: {
      title: "Zaznamenejte příchozí požadavky",
      description:
        "Odesílejte nové požadavky k přezkoumání, stanovení priorit a sledování v rámci pracovního postupu vašeho projektu.",
      cta_primary: "Vytvořit příchozí požadavek",
    },
    intake_main: {
      title: "Vyberte příchozí pracovní položku pro zobrazení jejích podrobností",
    },
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
    archive_work_items: {
      title: "Zatím žádné archivované pracovní položky",
      description:
        "Ručně nebo pomocí automatizace můžete archivovat dokončené nebo zrušené pracovní položky. Najdete je zde, jakmile budou archivovány.",
      cta_primary: "Nastavit automatizaci",
    },
    archive_cycles: {
      title: "Zatím žádné archivované cykly",
      description: "Pro úklid vašeho projektu archivujte dokončené cykly. Najdete je zde, jakmile budou archivovány.",
    },
    archive_modules: {
      title: "Zatím žádné archivované moduly",
      description:
        "Pro úklid vašeho projektu archivujte dokončené nebo zrušené moduly. Najdete je zde, jakmile budou archivovány.",
    },
    home_widget_quick_links: {
      title: "Mějte po ruce důležité odkazy, zdroje nebo dokumenty pro vaši práci",
    },
    inbox_sidebar_all: {
      title: "Aktualizace pro vaše odebírané pracovní položky se zobrazí zde",
    },
    inbox_sidebar_mentions: {
      title: "Zmínky o vašich pracovních položkách se zobrazí zde",
    },
    your_work_by_priority: {
      title: "Zatím není přiřazena žádná pracovní položka",
    },
    your_work_by_state: {
      title: "Zatím není přiřazena žádná pracovní položka",
    },
    views: {
      title: "Zatím žádné pohledy",
      description:
        "Přidejte pracovní položky do svého projektu a používejte pohledy pro snadné filtrování, třídění a sledování pokroku.",
      cta_primary: "Přidat pracovní položku",
    },
    drafts: {
      title: "Napůl napsané pracovní položky",
      description:
        "Chcete-li to vyzkoušet, začněte přidávat pracovní položku a nechte ji nedokončenou nebo vytvořte svůj první koncept níže. 😉",
      cta_primary: "Vytvořit koncept pracovní položky",
    },
    projects_archived: {
      title: "Žádné archivované projekty",
      description: "Vypadá to, že všechny vaše projekty jsou stále aktivní—skvělá práce!",
    },
    analytics_projects: {
      title: "Vytvořte projekty pro vizualizaci metrik projektu zde.",
    },
    analytics_work_items: {
      title:
        "Vytvořte projekty s pracovními položkami a přiřazenými osobami pro zahájení sledování výkonu, pokroku a dopadu týmu zde.",
    },
    analytics_no_cycle: {
      title: "Vytvořte cykly pro organizaci práce do časově omezených fází a sledování pokroku napříč sprinty.",
    },
    analytics_no_module: {
      title: "Vytvořte moduly pro organizaci své práce a sledování pokroku napříč různými fázemi.",
    },
    analytics_no_intake: {
      title: "Nastavte příjem pro správu příchozích požadavků a sledování, jak jsou přijímány a odmítány",
    },
    home_widget_stickies: {
      title: "Poznamenejte si nápad, zachyťte aha moment nebo zaznamenejte náhlý nápad. Přidejte poznámku a začněte.",
    },
    stickies: {
      title: "Zachyťte nápady okamžitě",
      description: "Vytvářejte poznámky pro rychlé poznámky a úkoly a mějte je u sebe, kamkoli jdete.",
      cta_primary: "Vytvořit první poznámku",
      cta_secondary: "Dokumentace",
    },
    active_cycles: {
      title: "Žádné aktivní cykly",
      description:
        "Momentálně nemáte žádné probíhající cykly. Aktivní cykly se zde zobrazí, když budou zahrnovat dnešní datum.",
    },
    teamspaces: {
      title: "S týmovými prostory odemkněte lepší organizaci a sledování",
      description:
        "Vytvořte vyhrazený prostor pro každý skutečný tým, oddělený od všech ostatních pracovních povrchů v Plane, a přizpůsobte je tomu, jak váš tým pracuje.",
      cta_primary: "Vytvořit nový týmový prostor",
    },
    initiatives: {
      title: "Sledujte projekty a epiky z jednoho místa",
      description:
        "Použijte iniciativy ke seskupení a sledování souvisejících projektů a epiků. Zobrazujte pokrok, priority a výsledky—vše z jediné obrazovky.",
      cta_primary: "Vytvořit iniciativu",
    },
    customers: {
      title: "Spravujte práci podle toho, co je důležité pro vaše zákazníky",
      description:
        "Propojte požadavky zákazníků s pracovními položkami, přiřaďte prioritu podle požadavků a shrňte stavy pracovních položek do záznamů zákazníků. Brzy se budete moci integrovat s vaším CRM nebo nástrojem podpory pro ještě lepší správu práce podle atributů zákazníků.",
      cta_primary: "Vytvořit záznam zákazníka",
    },
    dashboard: {
      title: "Vizualizujte svůj pokrok pomocí přehledů",
      description:
        "Vytvářejte přizpůsobitelné přehledy pro sledování metrik, měření výsledků a efektivní prezentaci poznatků.",
      cta_primary: "Vytvořit nový přehled",
    },
    wiki: {
      title: "Napište poznámku, dokument nebo celou znalostní bázi.",
      description:
        "Stránky jsou prostorem pro zachycení myšlenek v Plane. Pořizujte poznámky ze schůzek, snadno je formátujte, vkládejte pracovní položky, uspořádejte je pomocí knihovny komponent a udržujte vše v kontextu vašeho projektu.",
      cta_primary: "Vytvořte svou stránku",
    },
    project_overview_state_sidebar: {
      title: "Povolit stavy projektu",
      description: "Povolte stavy projektu pro zobrazení a správu vlastností jako stav, priorita, termíny a další.",
    },
  },
  settings_empty_state: {
    estimates: {
      title: "Zatím žádné odhady",
      description: "Definujte, jak váš tým měří úsilí, a sledujte to konzistentně napříč všemi pracovními položkami.",
      cta_primary: "Přidat systém odhadů",
    },
    labels: {
      title: "Zatím žádné štítky",
      description: "Vytvořte personalizované štítky pro efektivní kategorizaci a správu vašich pracovních položek.",
      cta_primary: "Vytvořte svůj první štítek",
    },
    exports: {
      title: "Zatím žádné exporty",
      description: "Momentálně nemáte žádné záznamy exportu. Jakmile exportujete data, všechny záznamy se zobrazí zde.",
    },
    tokens: {
      title: "Zatím žádný osobní token",
      description:
        "Generujte bezpečné API tokeny pro připojení vašeho pracovního prostoru s externími systémy a aplikacemi.",
      cta_primary: "Přidat API token",
    },
    webhooks: {
      title: "Zatím nebyl přidán žádný Webhook",
      description: "Automatizujte oznámení externím službám při výskytu událostí projektu.",
      cta_primary: "Přidat webhook",
    },
    teamspace: {
      title: "Zatím žádný týmový prostor",
      description:
        "Spojte své členy v týmovém prostoru pro sledování pokroku, pracovní zátěže a aktivity - bez námahy. Zjistit více",
      cta_primary: "Přidat týmový prostor",
    },
    work_item_types: {
      title: "Vytvářejte a přizpůsobujte typy pracovních položek",
      description:
        "Definujte jedinečné typy pracovních položek pro váš projekt. Každý typ může mít své vlastní vlastnosti, pracovní postupy a pole - přizpůsobené potřebám vašeho projektu a týmu.",
      cta_primary: "Povolit",
    },
    work_item_type_properties: {
      title:
        "Definujte vlastnost a podrobnosti, které chcete zachytit pro tento typ pracovní položky. Přizpůsobte jej pracovnímu postupu vašeho projektu.",
      cta_secondary: "Přidat vlastnost",
    },
    epic_setting: {
      title: "Povolit epiky",
      description:
        "Seskupte související pracovní položky do větších celků, které se rozprostírají přes více cyklů a modulů - ideální pro sledování celkového pokroku.",
      cta_primary: "Povolit",
    },
    templates: {
      title: "Zatím žádné šablony",
      description:
        "Zkraťte dobu nastavení vytvářením šablon pro pracovní položky a stránky — a začněte novou práci během několika sekund.",
      cta_primary: "Vytvořte svou první šablonu",
    },
    recurring_work_items: {
      title: "Zatím žádná opakující se pracovní položka",
      description:
        "Nastavte opakující se pracovní položky pro automatizaci opakujících se úkolů a snadné dodržování harmonogramu.",
      cta_primary: "Vytvořit opakující se pracovní položku",
    },
    worklogs: {
      title: "Sledujte časové výkazy pro všechny členy",
      description:
        "Zaznamenávejte čas na pracovních položkách pro zobrazení podrobných časových výkazů pro jakéhokoli člena týmu napříč projekty.",
    },
    customers_setting: {
      title: "Povolte správu zákazníků pro začátek.",
      cta_primary: "Povolit",
    },
    template_setting: {
      title: "Zatím žádné šablony",
      description:
        "Zkraťte dobu nastavení vytvářením šablon pro projekty, pracovní položky a stránky — a začněte novou práci během několika sekund.",
      cta_primary: "Vytvořit šablonu",
    },
  },
} as const;
