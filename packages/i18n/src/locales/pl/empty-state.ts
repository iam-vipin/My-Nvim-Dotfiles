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
      title: "Nie ma jeszcze metryk postępu do wyświetlenia.",
      description: "Zacznij ustawiać wartości właściwości w elementach roboczych, aby zobaczyć tutaj metryki postępu.",
    },
    updates: {
      title: "Jeszcze brak aktualizacji.",
      description: "Gdy członkowie projektu dodadzą aktualizacje, pojawią się one tutaj",
    },
    search: {
      title: "Brak pasujących wyników.",
      description: "Nie znaleziono wyników. Spróbuj dostosować wyszukiwane hasła.",
    },
    not_found: {
      title: "Ups! Coś wydaje się nie tak",
      description: "Obecnie nie możemy pobrać Twojego konta plane. Może to być błąd sieci.",
      cta_primary: "Spróbuj przeładować",
    },
    server_error: {
      title: "Błąd serwera",
      description: "Nie możemy się połączyć i pobrać danych z naszego serwera. Nie martw się, pracujemy nad tym.",
      cta_primary: "Spróbuj przeładować",
    },
  },
  project_empty_state: {
    no_access: {
      title: "Wygląda na to, że nie masz dostępu do tego projektu",
      restricted_description: "Skontaktuj się z administratorem, aby poprosić o dostęp i móc kontynuować tutaj.",
      join_description: "Kliknij przycisk poniżej, aby dołączyć.",
      cta_primary: "Dołącz do projektu",
      cta_loading: "Dołączanie do projektu",
    },
    invalid_project: {
      title: "Projekt nie został znaleziony",
      description: "Projekt, którego szukasz, nie istnieje.",
    },
    work_items: {
      title: "Zacznij od swojego pierwszego elementu roboczego.",
      description:
        "Elementy robocze są podstawowymi elementami Twojego projektu — przypisuj właścicieli, ustalaj priorytety i łatwo śledź postęp.",
      cta_primary: "Utwórz swój pierwszy element roboczy",
    },
    cycles: {
      title: "Grupuj i ograniczaj czasowo swoją pracę w Cyklach.",
      description:
        "Podziel pracę na bloki czasowe, pracuj wstecz od terminu projektu, aby ustalić daty, i osiągaj wymierny postęp jako zespół.",
      cta_primary: "Ustaw swój pierwszy cykl",
    },
    cycle_work_items: {
      title: "Brak elementów roboczych do wyświetlenia w tym cyklu",
      description:
        "Utwórz elementy robocze, aby rozpocząć monitorowanie postępów Twojego zespołu w tym cyklu i osiągnąć swoje cele na czas.",
      cta_primary: "Utwórz element roboczy",
      cta_secondary: "Dodaj istniejący element roboczy",
    },
    modules: {
      title: "Mapuj cele swojego projektu na Moduły i łatwo śledź.",
      description:
        "Moduły składają się z połączonych elementów roboczych. Pomagają one monitorować postęp przez fazy projektu, każda z konkretnymi terminami i analityką, aby wskazać, jak blisko jesteś osiągnięcia tych faz.",
      cta_primary: "Ustaw swój pierwszy moduł",
    },
    module_work_items: {
      title: "Brak elementów roboczych do wyświetlenia w tym Module",
      description: "Utwórz elementy robocze, aby rozpocząć monitorowanie tego modułu.",
      cta_primary: "Utwórz element roboczy",
      cta_secondary: "Dodaj istniejący element roboczy",
    },
    views: {
      title: "Zapisz niestandardowe widoki dla swojego projektu",
      description:
        "Widoki to zapisane filtry, które pomagają szybko uzyskać dostęp do najczęściej używanych informacji. Współpracuj bez wysiłku, gdy członkowie zespołu udostępniają i dostosowują widoki do swoich konkretnych potrzeb.",
      cta_primary: "Utwórz widok",
    },
    no_work_items_in_project: {
      title: "Brak elementów roboczych w projekcie jeszcze",
      description:
        "Dodaj elementy robocze do swojego projektu i podziel swoją pracę na śledzone części za pomocą widoków.",
      cta_primary: "Dodaj element roboczy",
    },
    work_item_filter: {
      title: "Nie znaleziono elementów roboczych",
      description: "Twój aktualny filtr nie zwrócił żadnych wyników. Spróbuj zmienić filtry.",
      cta_primary: "Dodaj element roboczy",
    },
    pages: {
      title: "Dokumentuj wszystko — od notatek po PRD",
      description:
        "Strony pozwalają przechwytywać i organizować informacje w jednym miejscu. Pisz notatki ze spotkań, dokumentację projektu i PRD, osadzaj elementy robocze i strukturyzuj je za pomocą gotowych komponentów.",
      cta_primary: "Utwórz swoją pierwszą Stronę",
    },
    archive_pages: {
      title: "Jeszcze brak zarchiwizowanych stron",
      description:
        "Archiwizuj strony, które nie są na Twoim radarze. Uzyskaj do nich dostęp tutaj, gdy będzie to potrzebne.",
    },
    intake_sidebar: {
      title: "Rejestruj zgłoszenia przyjmowane",
      description:
        "Przesyłaj nowe zgłoszenia do przeglądu, ustalania priorytetów i śledzenia w ramach przepływu pracy Twojego projektu.",
      cta_primary: "Utwórz zgłoszenie przyjmowane",
    },
    intake_main: {
      title: "Wybierz element roboczy Intake, aby wyświetlić jego szczegóły",
    },
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
    archive_work_items: {
      title: "Jeszcze brak zarchiwizowanych elementów roboczych",
      description:
        "Ręcznie lub za pomocą automatyzacji możesz archiwizować ukończone lub anulowane elementy robocze. Znajdź je tutaj po zarchiwizowaniu.",
      cta_primary: "Ustaw automatyzację",
    },
    archive_cycles: {
      title: "Jeszcze brak zarchiwizowanych cykli",
      description: "Aby uporządkować swój projekt, archiwizuj ukończone cykle. Znajdź je tutaj po zarchiwizowaniu.",
    },
    archive_modules: {
      title: "Jeszcze brak zarchiwizowanych Modułów",
      description:
        "Aby uporządkować swój projekt, archiwizuj ukończone lub anulowane moduły. Znajdź je tutaj po zarchiwizowaniu.",
    },
    home_widget_quick_links: {
      title: "Miej pod ręką ważne odniesienia, zasoby lub dokumenty do swojej pracy",
    },
    inbox_sidebar_all: {
      title: "Aktualizacje dla Twoich subskrybowanych elementów roboczych pojawią się tutaj",
    },
    inbox_sidebar_mentions: {
      title: "Wzmianki dotyczące Twoich elementów roboczych pojawią się tutaj",
    },
    your_work_by_priority: {
      title: "Jeszcze nie przypisano elementu roboczego",
    },
    your_work_by_state: {
      title: "Jeszcze nie przypisano elementu roboczego",
    },
    views: {
      title: "Jeszcze brak Widoków",
      description:
        "Dodaj elementy robocze do swojego projektu i używaj widoków do filtrowania, sortowania i monitorowania postępów bez wysiłku.",
      cta_primary: "Dodaj element roboczy",
    },
    drafts: {
      title: "Półnapisane elementy robocze",
      description:
        "Aby to wypróbować, zacznij dodawać element roboczy i zostaw go w połowie lub utwórz swój pierwszy szkic poniżej. 😉",
      cta_primary: "Utwórz szkic elementu roboczego",
    },
    projects_archived: {
      title: "Brak zarchiwizowanych projektów",
      description: "Wygląda na to, że wszystkie Twoje projekty są nadal aktywne—świetna robota!",
    },
    analytics_projects: {
      title: "Utwórz projekty, aby wizualizować metryki projektu tutaj.",
    },
    analytics_work_items: {
      title:
        "Utwórz projekty z elementami roboczymi i osobami przypisanymi, aby rozpocząć śledzenie wydajności, postępów i wpływu zespołu tutaj.",
    },
    analytics_no_cycle: {
      title: "Utwórz cykle, aby organizować pracę w fazy czasowe i śledzić postępy przez sprinty.",
    },
    analytics_no_module: {
      title: "Utwórz moduły, aby organizować swoją pracę i śledzić postępy przez różne fazy.",
    },
    analytics_no_intake: {
      title:
        "Skonfiguruj przyjmowanie, aby zarządzać przychodzącymi zgłoszeniami i śledzić, jak są akceptowane i odrzucane",
    },
    home_widget_stickies: {
      title: "Zapisz pomysł, uchwć moment olśnienia lub nagraj falę mózgową. Dodaj notatkę, aby rozpocząć.",
    },
    stickies: {
      title: "Przechwytuj pomysły natychmiast",
      description:
        "Twórz notatki na szybkie notatki i zadania do zrobienia i zabieraj je ze sobą, dokądkolwiek się udasz.",
      cta_primary: "Utwórz pierwszą notatkę",
      cta_secondary: "Dokumentacja",
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
    project_overview_state_sidebar: {
      title: "Włącz stany projektu",
      description:
        "Włącz stany projektu, aby wyświetlać i zarządzać właściwościami takimi jak stan, priorytet, terminy i inne.",
    },
  },
  settings_empty_state: {
    estimates: {
      title: "Jeszcze brak szacunków",
      description:
        "Zdefiniuj, jak Twój zespół mierzy wysiłek i śledź to konsekwentnie we wszystkich elementach roboczych.",
      cta_primary: "Dodaj system szacowania",
    },
    labels: {
      title: "Jeszcze brak etykiet",
      description:
        "Twórz spersonalizowane etykiety, aby skutecznie kategoryzować i zarządzać swoimi elementami roboczymi.",
      cta_primary: "Utwórz swoją pierwszą etykietę",
    },
    exports: {
      title: "Jeszcze brak eksportów",
      description:
        "Obecnie nie masz żadnych rekordów eksportu. Po wyeksportowaniu danych wszystkie rekordy pojawią się tutaj.",
    },
    tokens: {
      title: "Jeszcze brak Tokenu osobistego",
      description:
        "Generuj bezpieczne tokeny API, aby połączyć swój obszar roboczy z zewnętrznymi systemami i aplikacjami.",
      cta_primary: "Dodaj token API",
    },
    webhooks: {
      title: "Nie dodano jeszcze webhooka",
      description: "Automatyzuj powiadomienia do usług zewnętrznych, gdy wystąpią zdarzenia projektowe.",
      cta_primary: "Dodaj webhook",
    },
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
