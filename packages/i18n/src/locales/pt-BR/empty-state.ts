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
      title: "Ainda não há métricas de progresso para mostrar.",
      description:
        "Comece definindo valores de propriedades em itens de trabalho para ver as métricas de progresso aqui.",
    },
    updates: {
      title: "Ainda não há atualizações.",
      description: "Quando os membros do projeto adicionarem atualizações, elas aparecerão aqui",
    },
    search: {
      title: "Nenhum resultado correspondente.",
      description: "Nenhum resultado encontrado. Tente ajustar seus termos de pesquisa.",
    },
    not_found: {
      title: "Ops! Algo parece errado",
      description: "Não conseguimos buscar sua conta Plane no momento. Pode ser um erro de rede.",
      cta_primary: "Tentar recarregar",
    },
    server_error: {
      title: "Erro do servidor",
      description:
        "Não conseguimos conectar e buscar dados do nosso servidor. Não se preocupe, estamos trabalhando nisso.",
      cta_primary: "Tentar recarregar",
    },
  },
  project_empty_state: {
    no_access: {
      title: "Parece que você não tem acesso a este projeto",
      restricted_description:
        "Entre em contato com o administrador para solicitar acesso e você poderá continuar aqui.",
      join_description: "Clique no botão abaixo para participar.",
      cta_primary: "Participar do projeto",
      cta_loading: "Participando do projeto",
    },
    invalid_project: {
      title: "Projeto não encontrado",
      description: "O projeto que você está procurando não existe.",
    },
    work_items: {
      title: "Comece com seu primeiro item de trabalho.",
      description:
        "Os itens de trabalho são os blocos de construção do seu projeto — atribua proprietários, defina prioridades e acompanhe o progresso facilmente.",
      cta_primary: "Criar seu primeiro item de trabalho",
    },
    cycles: {
      title: "Agrupe e defina prazos para seu trabalho em Ciclos.",
      description:
        "Divida o trabalho em blocos com prazo definido, trabalhe de trás para frente a partir do prazo do projeto para definir datas e faça progresso tangível como equipe.",
      cta_primary: "Definir seu primeiro ciclo",
    },
    cycle_work_items: {
      title: "Nenhum item de trabalho para mostrar neste ciclo",
      description:
        "Crie itens de trabalho para começar a monitorar o progresso da sua equipe neste ciclo e atingir seus objetivos no prazo.",
      cta_primary: "Criar item de trabalho",
      cta_secondary: "Adicionar item de trabalho existente",
    },
    modules: {
      title: "Mapeie as metas do seu projeto para Módulos e acompanhe facilmente.",
      description:
        "Os módulos são compostos por itens de trabalho interconectados. Eles auxiliam no monitoramento do progresso através das fases do projeto, cada uma com prazos e análises específicas para indicar o quão perto você está de alcançar essas fases.",
      cta_primary: "Definir seu primeiro módulo",
    },
    module_work_items: {
      title: "Nenhum item de trabalho para mostrar neste Módulo",
      description: "Crie itens de trabalho para começar a monitorar este módulo.",
      cta_primary: "Criar item de trabalho",
      cta_secondary: "Adicionar item de trabalho existente",
    },
    views: {
      title: "Salve visualizações personalizadas para seu projeto",
      description:
        "As visualizações são filtros salvos que ajudam você a acessar rapidamente as informações que mais usa. Colabore sem esforço enquanto os colegas de equipe compartilham e adaptam as visualizações às suas necessidades específicas.",
      cta_primary: "Criar visualização",
    },
    no_work_items_in_project: {
      title: "Ainda não há itens de trabalho no projeto",
      description:
        "Adicione itens de trabalho ao seu projeto e divida seu trabalho em partes rastreáveis com visualizações.",
      cta_primary: "Adicionar item de trabalho",
    },
    work_item_filter: {
      title: "Nenhum item de trabalho encontrado",
      description: "Seu filtro atual não retornou nenhum resultado. Tente alterar os filtros.",
      cta_primary: "Adicionar item de trabalho",
    },
    pages: {
      title: "Documente tudo — de notas a PRDs",
      description:
        "As páginas permitem que você capture e organize informações em um só lugar. Escreva notas de reuniões, documentação de projetos e PRDs, incorpore itens de trabalho e estruture-os com componentes prontos para uso.",
      cta_primary: "Criar sua primeira Página",
    },
    archive_pages: {
      title: "Ainda não há páginas arquivadas",
      description: "Arquive páginas que não estão no seu radar. Acesse-as aqui quando necessário.",
    },
    intake_sidebar: {
      title: "Registrar solicitações de Entrada",
      description:
        "Envie novas solicitações para serem revisadas, priorizadas e rastreadas dentro do fluxo de trabalho do seu projeto.",
      cta_primary: "Criar solicitação de Entrada",
    },
    intake_main: {
      title: "Selecione um item de trabalho de Entrada para ver seus detalhes",
    },
    epics: {
      title: "Transforme projetos complexos em épicos estruturados.",
      description: "Um épico ajuda você a organizar grandes objetivos em tarefas menores e rastreáveis.",
      cta_primary: "Criar um Épico",
      cta_secondary: "Documentação",
    },
    epic_work_items: {
      title: "Você ainda não adicionou itens de trabalho a este épico.",
      description: "Comece adicionando alguns itens de trabalho a este épico e acompanhe-os aqui.",
      cta_secondary: "Adicionar itens de trabalho",
    },
  },
  workspace_empty_state: {
    archive_work_items: {
      title: "Ainda não há itens de trabalho arquivados",
      description:
        "Manualmente ou por meio de automação, você pode arquivar itens de trabalho concluídos ou cancelados. Encontre-os aqui uma vez arquivados.",
      cta_primary: "Configurar automação",
    },
    archive_cycles: {
      title: "Ainda não há ciclos arquivados",
      description: "Para organizar seu projeto, arquive ciclos concluídos. Encontre-os aqui uma vez arquivados.",
    },
    archive_modules: {
      title: "Ainda não há Módulos arquivados",
      description:
        "Para organizar seu projeto, arquive módulos concluídos ou cancelados. Encontre-os aqui uma vez arquivados.",
    },
    home_widget_quick_links: {
      title: "Mantenha referências, recursos ou documentos importantes à mão para o seu trabalho",
    },
    inbox_sidebar_all: {
      title: "As atualizações dos seus itens de trabalho inscritos aparecerão aqui",
    },
    inbox_sidebar_mentions: {
      title: "As menções aos seus itens de trabalho aparecerão aqui",
    },
    your_work_by_priority: {
      title: "Ainda não há item de trabalho atribuído",
    },
    your_work_by_state: {
      title: "Ainda não há item de trabalho atribuído",
    },
    views: {
      title: "Ainda não há Visualizações",
      description:
        "Adicione itens de trabalho ao seu projeto e use visualizações para filtrar, classificar e monitorar o progresso sem esforço.",
      cta_primary: "Adicionar item de trabalho",
    },
    drafts: {
      title: "Itens de trabalho semi-escritos",
      description:
        "Para experimentar isso, comece a adicionar um item de trabalho e deixe-o no meio do caminho ou crie seu primeiro rascunho abaixo. 😉",
      cta_primary: "Criar item de trabalho de rascunho",
    },
    projects_archived: {
      title: "Nenhum projeto arquivado",
      description: "Parece que todos os seus projetos ainda estão ativos — ótimo trabalho!",
    },
    analytics_projects: {
      title: "Crie projetos para visualizar as métricas do projeto aqui.",
    },
    analytics_work_items: {
      title:
        "Crie projetos com itens de trabalho e responsáveis para começar a rastrear desempenho, progresso e impacto da equipe aqui.",
    },
    analytics_no_cycle: {
      title: "Crie ciclos para organizar o trabalho em fases com prazo definido e acompanhar o progresso em sprints.",
    },
    analytics_no_module: {
      title: "Crie módulos para organizar seu trabalho e acompanhar o progresso em diferentes estágios.",
    },
    analytics_no_intake: {
      title: "Configure a entrada para gerenciar solicitações recebidas e rastrear como elas são aceitas e rejeitadas",
    },
    home_widget_stickies: {
      title:
        "Anote uma ideia, capture um momento de inspiração ou registre um lampejo. Adicione um adesivo para começar.",
    },
    stickies: {
      title: "Capture ideias instantaneamente",
      description: "Crie adesivos para notas rápidas e tarefas pendentes, e mantenha-os com você onde quer que vá.",
      cta_primary: "Criar primeiro adesivo",
      cta_secondary: "Documentação",
    },
    active_cycles: {
      title: "Nenhum ciclo ativo",
      description:
        "Você não tem nenhum ciclo em andamento no momento. Os ciclos ativos aparecem aqui quando incluem a data de hoje.",
    },
    teamspaces: {
      title: "Com espaços de equipe, desbloqueie melhor organização e rastreamento",
      description:
        "Crie uma superfície dedicada para cada equipe do mundo real, separada de todas as outras superfícies de trabalho no Plane, e personalize-as para se adequar à forma como sua equipe trabalha.",
      cta_primary: "Criar um novo Espaço de Equipe",
    },
    initiatives: {
      title: "Acompanhe projetos e épicos de um só lugar",
      description:
        "Use iniciativas para agrupar e monitorar projetos e épicos relacionados. Veja progresso, prioridades e resultados — tudo em uma única tela.",
      cta_primary: "Criar uma Iniciativa",
    },
    customers: {
      title: "Gerencie o trabalho pelo que é importante para seus clientes",
      description:
        "Traga solicitações de clientes para itens de trabalho, atribua prioridade por solicitações e consolide os estados dos itens de trabalho nos registros de clientes. Em breve, você integrará com sua ferramenta de CRM ou Suporte para um gerenciamento de trabalho ainda melhor por atributos de clientes.",
      cta_primary: "Criar registro de cliente",
    },
    dashboard: {
      title: "Visualize seu progresso com painéis",
      description:
        "Crie painéis personalizáveis para rastrear métricas, medir resultados e apresentar insights de forma eficaz.",
      cta_primary: "Criar novo painel",
    },
    wiki: {
      title: "Escreva uma nota, um documento ou uma base de conhecimento completa.",
      description:
        "As páginas são espaço para capturar pensamentos no Plane. Anote notas de reuniões, formate-as facilmente, incorpore itens de trabalho, organize-as usando uma biblioteca de componentes e mantenha todas no contexto do seu projeto.",
      cta_primary: "Criar sua página",
    },
    project_overview_state_sidebar: {
      title: "Ativar estados do projeto",
      description:
        "Ative os estados do projeto para visualizar e gerenciar propriedades como estado, prioridade, datas de vencimento e mais.",
    },
  },
  settings_empty_state: {
    estimates: {
      title: "Ainda não há estimativas",
      description:
        "Defina como sua equipe mede o esforço e acompanhe-o consistentemente em todos os itens de trabalho.",
      cta_primary: "Adicionar sistema de estimativas",
    },
    labels: {
      title: "Ainda não há etiquetas",
      description: "Crie etiquetas personalizadas para categorizar e gerenciar efetivamente seus itens de trabalho.",
      cta_primary: "Criar sua primeira etiqueta",
    },
    exports: {
      title: "Ainda não há exportações",
      description:
        "Você não tem nenhum registro de exportação no momento. Depois de exportar dados, todos os registros aparecerão aqui.",
    },
    tokens: {
      title: "Ainda não há token Pessoal",
      description:
        "Gere tokens de API seguros para conectar seu espaço de trabalho com sistemas e aplicativos externos.",
      cta_primary: "Adicionar token de API",
    },
    webhooks: {
      title: "Ainda não foi adicionado nenhum Webhook",
      description: "Automatize notificações para serviços externos quando ocorrerem eventos do projeto.",
      cta_primary: "Adicionar webhook",
    },
    teamspace: {
      title: "Ainda não há espaço de equipe",
      description:
        "Reúna seus membros em um espaço de equipe para rastrear progresso, carga de trabalho e atividade - sem esforço. Saiba mais",
      cta_primary: "Adicionar espaço de equipe",
    },
    work_item_types: {
      title: "Crie e personalize tipos de itens de trabalho",
      description:
        "Defina tipos de itens de trabalho exclusivos para seu projeto. Cada tipo pode ter suas próprias propriedades, fluxos de trabalho e campos - adaptados às necessidades do seu projeto e equipe.",
      cta_primary: "Ativar",
    },
    work_item_type_properties: {
      title:
        "Defina a propriedade e os detalhes que você deseja capturar para este tipo de item de trabalho. Personalize-o para corresponder ao fluxo de trabalho do seu projeto.",
      cta_secondary: "Adicionar propriedade",
    },
    epic_setting: {
      title: "Ativar Épicos",
      description:
        "Agrupe itens de trabalho relacionados em corpos maiores que abrangem múltiplos ciclos e módulos - perfeito para rastrear o progresso do panorama geral.",
      cta_primary: "Ativar",
    },
    templates: {
      title: "Ainda não há modelos",
      description:
        "Reduza o tempo de configuração criando modelos para itens de trabalho e páginas — e comece novo trabalho em segundos.",
      cta_primary: "Criar seu primeiro modelo",
    },
    recurring_work_items: {
      title: "Ainda não há item de trabalho recorrente",
      description:
        "Configure itens de trabalho recorrentes para automatizar tarefas repetidas e manter-se no cronograma sem esforço.",
      cta_primary: "Criar item de trabalho recorrente",
    },
    worklogs: {
      title: "Acompanhe folhas de ponto para todos os membros",
      description:
        "Registre tempo em itens de trabalho para ver folhas de ponto detalhadas para qualquer membro da equipe em projetos.",
    },
    customers_setting: {
      title: "Ative o gerenciamento de clientes para começar.",
      cta_primary: "Ativar",
    },
    template_setting: {
      title: "Ainda não há modelos",
      description:
        "Reduza o tempo de configuração criando modelos para projetos, itens de trabalho e páginas — e comece novo trabalho em segundos.",
      cta_primary: "Criar modelo",
    },
  },
} as const;
