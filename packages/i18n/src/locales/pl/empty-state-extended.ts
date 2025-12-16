export default {
  project_empty_state: {
    epics: {
      title: "Przekształć złożone projekty w uporządkowane epiki.",
      description: "Epik pomaga organizować duże cele w mniejsze, śledzone zadania.",
      cta_primary: "Utwórz epik",
      cta_secondary: "Dokumentacja",
    },
    epic_work_items: {
      title: "Nie dodałeś jeszcze elementów roboczych do tego epiku.",
      description: "Zacznij od dodania elementów roboczych do tego epiku i śledź je tutaj.",
      cta_secondary: "Dodaj elementy robocze",
    },
  },
  workspace_empty_state: {
    home_widget_stickies: {
      title: "Zapisz pomysł, uchwć moment olśnienia lub nagraj falę mózgową. Dodaj notatkę, aby rozpocząć.",
    },
    stickies: {
      title: "Zapisz pomysł, uchwć moment olśnienia lub nagraj falę mózgową. Dodaj notatkę, aby rozpocząć.",
      cta_primary: "Dodaj notatkę",
    },
    active_cycles: {
      title: "Brak aktywnych cykli",
      description:
        "Nie masz teraz żadnych trwających cykli. Aktywne cykle pojawiają się tutaj, gdy obejmują dzisiejszą datę.",
    },
    teamspaces: {
      title: "Dzięki przestrzeniom zespołowym odblokuj lepszą organizację i śledzenie",
      description:
        "Utwórz dedykowaną przestrzeń dla każdego rzeczywistego zespołu, oddzieloną od wszystkich innych powierzchni roboczych w Plane i dostosuj je do sposobu pracy Twojego zespołu.",
      cta_primary: "Utwórz nową przestrzeń zespołową",
    },
    initiatives: {
      title: "Śledź projekty i epiki z jednego miejsca",
      description:
        "Używaj inicjatyw do grupowania i monitorowania powiązanych projektów i epików. Przeglądaj postępy, priorytety i wyniki — wszystko z jednego ekranu.",
      cta_primary: "Utwórz inicjatywę",
    },
    customers: {
      title: "Zarządzaj pracą według tego, co jest ważne dla Twoich klientów",
      description:
        "Przenieś prośby klientów do elementów roboczych, przypisz priorytet według próśb i przenieś stany elementów roboczych do rekordów klientów. Wkrótce zintegrujesz się z narzędziem CRM lub wsparciem, aby jeszcze lepiej zarządzać pracą według atrybutów klientów.",
      cta_primary: "Utwórz rekord klienta",
    },
    dashboard: {
      title: "Wizualizuj swój postęp za pomocą pulpitów nawigacyjnych",
      description:
        "Twórz konfigurowalne pulpity nawigacyjne do śledzenia metryk, mierzenia wyników i efektywnego prezentowania spostrzeżeń.",
      cta_primary: "Utwórz nowy pulpit nawigacyjny",
    },
    wiki: {
      title: "Napisz notatkę, dokument lub pełną bazę wiedzy.",
      description:
        "Strony to przestrzeń do wychwytywania myśli w Plane. Zapisuj notatki ze spotkań, łatwo je formatuj, osadzaj elementy robocze, układaj je za pomocą biblioteki komponentów i zachowuj wszystkie w kontekście projektu.",
      cta_primary: "Utwórz swoją stronę",
    },
  },
  settings_empty_state: {
    teamspace: {
      title: "Brak przestrzeni zespołowej",
      description:
        "Zgromadź swoich członków w przestrzeni zespołowej, aby śledzić postępy, obciążenie pracą i aktywność - bez wysiłku. Dowiedz się więcej",
      cta_primary: "Dodaj przestrzeń zespołową",
    },
    work_item_types: {
      title: "Twórz i dostosowuj typy elementów roboczych",
      description:
        "Zdefiniuj unikalne typy elementów roboczych dla swojego projektu. Każdy typ może mieć własne właściwości, przepływy pracy i pola - dostosowane do potrzeb Twojego projektu i zespołu.",
      cta_primary: "Włącz",
    },
    work_item_type_properties: {
      title:
        "Zdefiniuj właściwości i szczegóły, które chcesz przechwycić dla tego typu elementu roboczego. Dostosuj go do przepływu pracy Twojego projektu.",
      cta_secondary: "Dodaj właściwość",
    },
    epic_setting: {
      title: "Włącz epiki",
      description:
        "Grupuj powiązane elementy robocze w większe całości obejmujące wiele cykli i modułów - idealnie do śledzenia postępów w szerszej perspektywie.",
      cta_primary: "Włącz",
    },
    templates: {
      title: "Brak szablonów",
      description:
        "Skróć czas konfiguracji, tworząc szablony dla elementów roboczych i stron — i rozpocznij nową pracę w ciągu kilku sekund.",
      cta_primary: "Utwórz swój pierwszy szablon",
    },
    recurring_work_items: {
      title: "Brak powtarzających się elementów roboczych",
      description:
        "Skonfiguruj powtarzające się elementy robocze, aby zautomatyzować powtarzające się zadania i bez wysiłku dotrzymywać harmonogramu.",
      cta_primary: "Utwórz powtarzający się element roboczy",
    },
    worklogs: {
      title: "Śledź karty czasu pracy dla wszystkich członków",
      description:
        "Rejestruj czas w elementach roboczych, aby wyświetlać szczegółowe karty czasu pracy dla każdego członka zespołu w projektach.",
    },
    customers_setting: {
      title: "Włącz zarządzanie klientami, aby rozpocząć.",
      cta_primary: "Włącz",
    },
    template_setting: {
      title: "Brak szablonów",
      description:
        "Skróć czas konfiguracji, tworząc szablony dla projektów, elementów roboczych i stron — i rozpocznij nową pracę w ciągu kilku sekund.",
      cta_primary: "Utwórz szablon",
    },
  },
} as const;
