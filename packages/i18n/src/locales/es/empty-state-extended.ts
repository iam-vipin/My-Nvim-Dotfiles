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
  project_empty_state: {
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
