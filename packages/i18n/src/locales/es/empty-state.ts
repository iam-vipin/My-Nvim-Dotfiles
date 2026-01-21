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
      title: "Todavía no hay métricas de progreso para mostrar.",
      description:
        "Comienza a establecer valores de propiedades en los elementos de trabajo para ver las métricas de progreso aquí.",
    },
    updates: {
      title: "Aún no hay actualizaciones.",
      description: "Una vez que los miembros del proyecto agreguen actualizaciones, aparecerán aquí",
    },
    search: {
      title: "No se encontraron resultados coincidentes.",
      description: "No se encontraron resultados. Intenta ajustar tus términos de búsqueda.",
    },
    not_found: {
      title: "¡Ups! Algo parece estar mal",
      description: "No podemos obtener tu cuenta de Plane actualmente. Esto podría ser un error de red.",
      cta_primary: "Intentar recargar",
    },
    server_error: {
      title: "Error del servidor",
      description:
        "No podemos conectarnos y obtener datos de nuestro servidor. No te preocupes, estamos trabajando en ello.",
      cta_primary: "Intentar recargar",
    },
  },
  project_empty_state: {
    no_access: {
      title: "Parece que no tienes acceso a este proyecto",
      restricted_description: "Contacta con el administrador para solicitar acceso y podrás continuar aquí.",
      join_description: "Haz clic en el botón de abajo para unirte.",
      cta_primary: "Unirse al proyecto",
      cta_loading: "Uniéndose al proyecto",
    },
    invalid_project: {
      title: "Proyecto no encontrado",
      description: "El proyecto que buscas no existe.",
    },
    work_items: {
      title: "Comienza con tu primer elemento de trabajo.",
      description:
        "Los elementos de trabajo son los bloques de construcción de tu proyecto — asigna responsables, establece prioridades y realiza un seguimiento del progreso fácilmente.",
      cta_primary: "Crea tu primer elemento de trabajo",
    },
    cycles: {
      title: "Agrupa y delimita tu trabajo en Ciclos.",
      description:
        "Divide el trabajo en bloques con tiempo definido, trabaja hacia atrás desde la fecha límite de tu proyecto para establecer fechas y haz un progreso tangible como equipo.",
      cta_primary: "Establece tu primer ciclo",
    },
    cycle_work_items: {
      title: "No hay elementos de trabajo para mostrar en este ciclo",
      description:
        "Crea elementos de trabajo para comenzar a monitorear el progreso de tu equipo en este ciclo y alcanzar tus objetivos a tiempo.",
      cta_primary: "Crear elemento de trabajo",
      cta_secondary: "Agregar elemento de trabajo existente",
    },
    modules: {
      title: "Asigna los objetivos de tu proyecto a Módulos y rastrea fácilmente.",
      description:
        "Los módulos están compuestos de elementos de trabajo interconectados. Ayudan a monitorear el progreso a través de las fases del proyecto, cada una con fechas límite específicas y análisis para indicar qué tan cerca estás de alcanzar esas fases.",
      cta_primary: "Establece tu primer módulo",
    },
    module_work_items: {
      title: "No hay elementos de trabajo para mostrar en este Módulo",
      description: "Crea elementos de trabajo para comenzar a monitorear este módulo.",
      cta_primary: "Crear elemento de trabajo",
      cta_secondary: "Agregar elemento de trabajo existente",
    },
    views: {
      title: "Guarda vistas personalizadas para tu proyecto",
      description:
        "Las vistas son filtros guardados que te ayudan a acceder rápidamente a la información que más usas. Colabora sin esfuerzo mientras los compañeros de equipo comparten y adaptan las vistas a sus necesidades específicas.",
      cta_primary: "Crear vista",
    },
    no_work_items_in_project: {
      title: "Aún no hay elementos de trabajo en el proyecto",
      description: "Agrega elementos de trabajo a tu proyecto y divide tu trabajo en piezas rastreables con vistas.",
      cta_primary: "Agregar elemento de trabajo",
    },
    work_item_filter: {
      title: "No se encontraron elementos de trabajo",
      description: "Tu filtro actual no devolvió ningún resultado. Intenta cambiar los filtros.",
      cta_primary: "Agregar elemento de trabajo",
    },
    pages: {
      title: "Documenta todo — desde notas hasta PRDs",
      description:
        "Las páginas te permiten capturar y organizar información en un solo lugar. Escribe notas de reuniones, documentación de proyectos y PRDs, incrusta elementos de trabajo y estructúralos con componentes listos para usar.",
      cta_primary: "Crea tu primera Página",
    },
    archive_pages: {
      title: "Aún no hay páginas archivadas",
      description: "Archiva las páginas que no están en tu radar. Accede a ellas aquí cuando las necesites.",
    },
    intake_sidebar: {
      title: "Registra solicitudes de Entrada",
      description:
        "Envía nuevas solicitudes para ser revisadas, priorizadas y rastreadas dentro del flujo de trabajo de tu proyecto.",
      cta_primary: "Crear solicitud de Entrada",
    },
    intake_main: {
      title: "Selecciona un elemento de trabajo de Entrada para ver sus detalles",
    },
    epics: {
      title: "Convierte proyectos complejos en épicas estructuradas.",
      description: "Una épica te ayuda a organizar grandes objetivos en tareas más pequeñas y rastreables.",
      cta_primary: "Crear una Épica",
      cta_secondary: "Documentación",
    },
    epic_work_items: {
      title: "Aún no has agregado elementos de trabajo a esta épica.",
      description: "Comienza agregando algunos elementos de trabajo a esta épica y rastréalos aquí.",
      cta_secondary: "Agregar elementos de trabajo",
    },
  },
  workspace_empty_state: {
    archive_work_items: {
      title: "Aún no hay elementos de trabajo archivados",
      description:
        "Manualmente o mediante automatización, puedes archivar elementos de trabajo que estén completados o cancelados. Encuéntralos aquí una vez archivados.",
      cta_primary: "Configurar automatización",
    },
    archive_cycles: {
      title: "Aún no hay ciclos archivados",
      description: "Para ordenar tu proyecto, archiva los ciclos completados. Encuéntralos aquí una vez archivados.",
    },
    archive_modules: {
      title: "Aún no hay Módulos archivados",
      description:
        "Para ordenar tu proyecto, archiva los módulos completados o cancelados. Encuéntralos aquí una vez archivados.",
    },
    home_widget_quick_links: {
      title: "Mantén a mano referencias importantes, recursos o documentos para tu trabajo",
    },
    inbox_sidebar_all: {
      title: "Las actualizaciones de tus elementos de trabajo suscritos aparecerán aquí",
    },
    inbox_sidebar_mentions: {
      title: "Las menciones a tus elementos de trabajo aparecerán aquí",
    },
    your_work_by_priority: {
      title: "Aún no hay elementos de trabajo asignados",
    },
    your_work_by_state: {
      title: "Aún no hay elementos de trabajo asignados",
    },
    views: {
      title: "Aún no hay Vistas",
      description:
        "Agrega elementos de trabajo a tu proyecto y usa vistas para filtrar, ordenar y monitorear el progreso sin esfuerzo.",
      cta_primary: "Agregar elemento de trabajo",
    },
    drafts: {
      title: "Elementos de trabajo a medio escribir",
      description:
        "Para probarlo, comienza a agregar un elemento de trabajo y déjalo a medias o crea tu primer borrador a continuación. 😉",
      cta_primary: "Crear borrador de elemento de trabajo",
    },
    projects_archived: {
      title: "No hay proyectos archivados",
      description: "Parece que todos tus proyectos siguen activos — ¡buen trabajo!",
    },
    analytics_projects: {
      title: "Crea proyectos para visualizar las métricas del proyecto aquí.",
    },
    analytics_work_items: {
      title:
        "Crea proyectos con elementos de trabajo y responsables para comenzar a rastrear el rendimiento, progreso e impacto del equipo aquí.",
    },
    analytics_no_cycle: {
      title:
        "Crea ciclos para organizar el trabajo en fases con límite de tiempo y rastrear el progreso en los sprints.",
    },
    analytics_no_module: {
      title: "Crea módulos para organizar tu trabajo y rastrear el progreso en diferentes etapas.",
    },
    analytics_no_intake: {
      title: "Configura la entrada para gestionar las solicitudes entrantes y rastrear cómo se aceptan y rechazan",
    },
    home_widget_stickies: {
      title:
        "Anota una idea, captura un descubrimiento o registra una lluvia de ideas. Agrega una nota adhesiva para comenzar.",
    },
    stickies: {
      title: "Captura ideas al instante",
      description:
        "Crea notas adhesivas para notas rápidas y tareas pendientes, y mantenlas contigo dondequiera que vayas.",
      cta_primary: "Crear primera nota adhesiva",
      cta_secondary: "Documentación",
    },
    active_cycles: {
      title: "No hay ciclos activos",
      description:
        "No tienes ningún ciclo en curso en este momento. Los ciclos activos aparecen aquí cuando incluyen la fecha de hoy.",
    },
    teamspaces: {
      title: "Con teamspaces desbloquea mejor organización y seguimiento",
      description:
        "Crea una superficie dedicada para cada equipo del mundo real, separada de todas las demás superficies de trabajo en Plane, y personalízalas para adaptarse a cómo trabaja tu equipo.",
      cta_primary: "Crear un nuevo Teamspace",
    },
    initiatives: {
      title: "Rastrea proyectos y épicas desde un solo lugar",
      description:
        "Usa iniciativas para agrupar y monitorear proyectos y épicas relacionados. Ve el progreso, prioridades y resultados — todo desde una sola pantalla.",
      cta_primary: "Crear una Iniciativa",
    },
    customers: {
      title: "Gestiona el trabajo según lo que es importante para tus clientes",
      description:
        "Vincula las solicitudes de los clientes a los elementos de trabajo, asigna prioridad según las solicitudes y agrupa los estados de los elementos de trabajo en los registros de los clientes. Pronto, podrás integrarte con tu herramienta de CRM o Soporte para una gestión del trabajo aún mejor según los atributos de los clientes.",
      cta_primary: "Crear registro de cliente",
    },
    dashboard: {
      title: "Visualiza tu progreso con paneles de control",
      description:
        "Crea paneles personalizables para rastrear métricas, medir resultados y presentar insights de manera efectiva.",
      cta_primary: "Crear nuevo panel",
    },
    wiki: {
      title: "Escribe una nota, un documento o una base de conocimientos completa.",
      description:
        "Las páginas son un espacio para capturar ideas en Plane. Toma notas de reuniones, dales formato fácilmente, incrusta elementos de trabajo, organízalas usando una biblioteca de componentes y mantenlas todas en el contexto de tu proyecto.",
      cta_primary: "Crea tu página",
    },
    project_overview_state_sidebar: {
      title: "Habilitar estados del proyecto",
      description:
        "Habilita los estados del proyecto para ver y gestionar propiedades como estado, prioridad, fechas de vencimiento y más.",
    },
  },
  settings_empty_state: {
    estimates: {
      title: "Aún no hay estimaciones",
      description:
        "Define cómo tu equipo mide el esfuerzo y rastréalo de manera consistente en todos los elementos de trabajo.",
      cta_primary: "Agregar sistema de estimación",
    },
    labels: {
      title: "Aún no hay etiquetas",
      description: "Crea etiquetas personalizadas para categorizar y gestionar efectivamente tus elementos de trabajo.",
      cta_primary: "Crea tu primera etiqueta",
    },
    exports: {
      title: "Aún no hay exportaciones",
      description:
        "No tienes ningún registro de exportación en este momento. Una vez que exportes datos, todos los registros aparecerán aquí.",
    },
    tokens: {
      title: "Aún no hay tokens Personales",
      description:
        "Genera tokens API seguros para conectar tu espacio de trabajo con sistemas y aplicaciones externos.",
      cta_primary: "Agregar token API",
    },
    webhooks: {
      title: "Aún no se ha agregado ningún Webhook",
      description: "Automatiza las notificaciones a servicios externos cuando ocurran eventos del proyecto.",
      cta_primary: "Agregar webhook",
    },
    teamspace: {
      title: "Aún no hay teamspace",
      description:
        "Reúne a tus miembros en un teamspace para rastrear el progreso, carga de trabajo y actividad — sin esfuerzo. Más información",
      cta_primary: "Agregar teamspace",
    },
    work_item_types: {
      title: "Crea y personaliza tipos de elementos de trabajo",
      description:
        "Define tipos únicos de elementos de trabajo para tu proyecto. Cada tipo puede tener sus propias propiedades, flujos de trabajo y campos — adaptados a las necesidades de tu proyecto y equipo.",
      cta_primary: "Habilitar",
    },
    work_item_type_properties: {
      title:
        "Define la propiedad y los detalles que deseas capturar para este tipo de elemento de trabajo. Personalízalo para que coincida con el flujo de trabajo de tu proyecto.",
      cta_secondary: "Agregar propiedad",
    },
    epic_setting: {
      title: "Habilitar Épicas",
      description:
        "Agrupa elementos de trabajo relacionados en cuerpos más grandes que abarquen múltiples ciclos y módulos — perfecto para rastrear el progreso general.",
      cta_primary: "Habilitar",
    },
    templates: {
      title: "Aún no hay plantillas",
      description:
        "Reduce el tiempo de configuración creando plantillas para elementos de trabajo y páginas — y comienza un nuevo trabajo en segundos.",
      cta_primary: "Crea tu primera plantilla",
    },
    recurring_work_items: {
      title: "Aún no hay elementos de trabajo recurrentes",
      description:
        "Configura elementos de trabajo recurrentes para automatizar tareas repetidas y mantenerte en el horario sin esfuerzo.",
      cta_primary: "Crear elemento de trabajo recurrente",
    },
    worklogs: {
      title: "Rastrea hojas de tiempo para todos los miembros",
      description:
        "Registra el tiempo en los elementos de trabajo para ver hojas de tiempo detalladas de cualquier miembro del equipo en todos los proyectos.",
    },
    customers_setting: {
      title: "Habilita la gestión de clientes para comenzar.",
      cta_primary: "Habilitar",
    },
    template_setting: {
      title: "Aún no hay plantillas",
      description:
        "Reduce el tiempo de configuración creando plantillas para proyectos, elementos de trabajo y páginas — y comienza un nuevo trabajo en segundos.",
      cta_primary: "Crear plantilla",
    },
  },
} as const;
