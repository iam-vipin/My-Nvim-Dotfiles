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
      title: "Henüz gösterilecek ilerleme metriği yok.",
      description: "İlerleme metriklerini burada görmek için iş öğelerinde özellik değerleri belirlemeye başlayın.",
    },
    updates: {
      title: "Henüz güncelleme yok.",
      description: "Proje üyeleri güncelleme eklediğinde burada görünecek",
    },
    search: {
      title: "Eşleşen sonuç yok.",
      description: "Sonuç bulunamadı. Arama terimlerinizi ayarlamayı deneyin.",
    },
    not_found: {
      title: "Hata! Bir şeyler ters gitti",
      description: "Şu anda Plane hesabınızı alamıyoruz. Bu bir ağ hatası olabilir.",
      cta_primary: "Yeniden yüklemeyi dene",
    },
    server_error: {
      title: "Sunucu hatası",
      description: "Sunucumuza bağlanamıyor ve veri alamıyoruz. Endişelenmeyin, üzerinde çalışıyoruz.",
      cta_primary: "Yeniden yüklemeyi dene",
    },
  },
  project_empty_state: {
    no_access: {
      title: "Görünüşe göre bu projeye erişiminiz yok",
      restricted_description: "Erişim talep etmek için yöneticiyle iletişime geçin, sonra burada devam edebilirsiniz.",
      join_description: "Katılmak için aşağıdaki butona tıklayın.",
      cta_primary: "Projeye katıl",
      cta_loading: "Projeye katılınıyor",
    },
    invalid_project: {
      title: "Proje bulunamadı",
      description: "Aradığınız proje mevcut değil.",
    },
    work_items: {
      title: "İlk iş öğenizle başlayın.",
      description:
        "İş öğeleri projenizin yapı taşlarıdır — sahipler atayın, öncelikleri belirleyin ve ilerlemeyi kolayca takip edin.",
      cta_primary: "İlk iş öğenizi oluşturun",
    },
    cycles: {
      title: "Çalışmanızı Döngülerde gruplayın ve zaman sınırlayın.",
      description:
        "Çalışmayı zaman sınırlı parçalara bölün, tarihleri belirlemek için proje son tarihinden geriye doğru çalışın ve bir ekip olarak somut ilerleme kaydedin.",
      cta_primary: "İlk döngünüzü ayarlayın",
    },
    cycle_work_items: {
      title: "Bu döngüde gösterilecek iş öğesi yok",
      description:
        "Ekibinizin bu döngüdeki ilerlemesini izlemeye başlamak ve hedeflerinize zamanında ulaşmak için iş öğeleri oluşturun.",
      cta_primary: "İş öğesi oluştur",
      cta_secondary: "Mevcut iş öğesini ekle",
    },
    modules: {
      title: "Proje hedeflerinizi Modüllere eşleyin ve kolayca takip edin.",
      description:
        "Modüller birbirine bağlı iş öğelerinden oluşur. Proje aşamalarındaki ilerlemeyi izlemeye yardımcı olurlar, her biri bu aşamalara ne kadar yakın olduğunuzu göstermek için belirli son tarihler ve analizlerle.",
      cta_primary: "İlk modülünüzü ayarlayın",
    },
    module_work_items: {
      title: "Bu Modülde gösterilecek iş öğesi yok",
      description: "Bu modülü izlemeye başlamak için iş öğeleri oluşturun.",
      cta_primary: "İş öğesi oluştur",
      cta_secondary: "Mevcut iş öğesini ekle",
    },
    views: {
      title: "Projeniz için özel görünümler kaydedin",
      description:
        "Görünümler, en çok kullandığınız bilgilere hızlı erişmenize yardımcı olan kaydedilmiş filtrelerdir. Ekip arkadaşları görünümleri paylaşıp kendi özel ihtiyaçlarına göre uyarladıkça zahmetsizce işbirliği yapın.",
      cta_primary: "Görünüm oluştur",
    },
    no_work_items_in_project: {
      title: "Projede henüz iş öğesi yok",
      description: "Projenize iş öğeleri ekleyin ve çalışmanızı görünümlerle takip edilebilir parçalara ayırın.",
      cta_primary: "İş öğesi ekle",
    },
    work_item_filter: {
      title: "İş öğesi bulunamadı",
      description: "Mevcut filtreniz hiçbir sonuç döndürmedi. Filtreleri değiştirmeyi deneyin.",
      cta_primary: "İş öğesi ekle",
    },
    pages: {
      title: "Her şeyi belgeleyin — notlardan PRD'lere",
      description:
        "Sayfalar bilgileri tek bir yerde yakalamanıza ve düzenlemenize olanak tanır. Toplantı notları, proje belgeleri ve PRD'ler yazın, iş öğelerini yerleştirin ve kullanıma hazır bileşenlerle yapılandırın.",
      cta_primary: "İlk Sayfanızı oluşturun",
    },
    archive_pages: {
      title: "Henüz arşivlenmiş sayfa yok",
      description: "Radarınızda olmayan sayfaları arşivleyin. Gerektiğinde buradan erişin.",
    },
    intake_sidebar: {
      title: "Giriş isteklerini kaydedin",
      description:
        "Projenizin iş akışı içinde incelenmek, önceliklendirilmek ve takip edilmek üzere yeni istekler gönderin.",
      cta_primary: "Giriş isteği oluştur",
    },
    intake_main: {
      title: "Ayrıntılarını görmek için bir Giriş iş öğesi seçin",
    },
    epics: {
      title: "Karmaşık projeleri yapılandırılmış destanlara dönüştürün.",
      description:
        "Bir destan, büyük hedefleri daha küçük, takip edilebilir görevlere organize etmenize yardımcı olur.",
      cta_primary: "Destan Oluştur",
      cta_secondary: "Belgeler",
    },
    epic_work_items: {
      title: "Bu destana henüz iş öğesi eklemediniz.",
      description: "Bu destana bazı iş öğeleri ekleyerek başlayın ve burada takip edin.",
      cta_secondary: "İş öğeleri ekle",
    },
  },
  workspace_empty_state: {
    archive_work_items: {
      title: "Henüz arşivlenmiş iş öğesi yok",
      description:
        "Manuel veya otomasyon yoluyla tamamlanmış veya iptal edilmiş iş öğelerini arşivleyebilirsiniz. Arşivlendikten sonra burada bulun.",
      cta_primary: "Otomasyonu ayarla",
    },
    archive_cycles: {
      title: "Henüz arşivlenmiş döngü yok",
      description: "Projenizi düzenlemek için tamamlanmış döngüleri arşivleyin. Arşivlendikten sonra burada bulun.",
    },
    archive_modules: {
      title: "Henüz arşivlenmiş Modül yok",
      description:
        "Projenizi düzenlemek için tamamlanmış veya iptal edilmiş modülleri arşivleyin. Arşivlendikten sonra burada bulun.",
    },
    home_widget_quick_links: {
      title: "Çalışmanız için önemli referansları, kaynakları veya belgeleri elinizin altında tutun",
    },
    inbox_sidebar_all: {
      title: "Abone olduğunuz iş öğeleri için güncellemeler burada görünecek",
    },
    inbox_sidebar_mentions: {
      title: "İş öğeleriniz için bahsetmeler burada görünecek",
    },
    your_work_by_priority: {
      title: "Henüz atanmış iş öğesi yok",
    },
    your_work_by_state: {
      title: "Henüz atanmış iş öğesi yok",
    },
    views: {
      title: "Henüz Görünüm yok",
      description:
        "Projenize iş öğeleri ekleyin ve zahmetsizce filtrelemek, sıralamak ve ilerlemeyi izlemek için görünümleri kullanın.",
      cta_primary: "İş öğesi ekle",
    },
    drafts: {
      title: "Yarım yazılmış iş öğeleri",
      description:
        "Bunu denemek için bir iş öğesi eklemeye başlayın ve yarıda bırakın veya aşağıda ilk taslağınızı oluşturun. 😉",
      cta_primary: "Taslak iş öğesi oluştur",
    },
    projects_archived: {
      title: "Arşivlenmiş proje yok",
      description: "Görünüşe göre tüm projeleriniz hala aktif—harika iş!",
    },
    analytics_projects: {
      title: "Proje metriklerini burada görselleştirmek için projeler oluşturun.",
    },
    analytics_work_items: {
      title:
        "Performansı, ilerlemeyi ve ekip etkisini burada izlemeye başlamak için iş öğeleri ve atananlar içeren projeler oluşturun.",
    },
    analytics_no_cycle: {
      title:
        "Çalışmayı zaman sınırlı aşamalara organize etmek ve sprintler boyunca ilerlemeyi takip etmek için döngüler oluşturun.",
    },
    analytics_no_module: {
      title: "Çalışmanızı organize etmek ve farklı aşamalarda ilerlemeyi takip etmek için modüller oluşturun.",
    },
    analytics_no_intake: {
      title:
        "Gelen istekleri yönetmek ve bunların nasıl kabul edildiğini ve reddedildiğini izlemek için giriş ayarlayın",
    },
    home_widget_stickies: {
      title:
        "Bir fikir yazın, bir aha anını yakalayın veya bir beyin dalgasını kaydedin. Başlamak için yapışkan not ekleyin.",
    },
    stickies: {
      title: "Fikirleri anında yakalayın",
      description:
        "Hızlı notlar ve yapılacaklar için yapışkan notlar oluşturun ve onları nereye giderseniz gidin yanınızda taşıyın.",
      cta_primary: "İlk yapışkan notu oluştur",
      cta_secondary: "Belgeler",
    },
    active_cycles: {
      title: "Aktif döngü yok",
      description: "Şu anda devam eden döngünüz yok. Aktif döngüler bugünün tarihini içerdiğinde burada görünür.",
    },
    teamspaces: {
      title: "Ekip alanlarıyla daha iyi organizasyon ve takibin kilidini açın",
      description:
        "Plane'deki diğer tüm çalışma yüzeylerinden ayrı, her gerçek dünya ekibi için özel bir yüzey oluşturun ve ekibinizin çalışma şekline uyacak şekilde özelleştirin.",
      cta_primary: "Yeni Ekip Alanı Oluştur",
    },
    initiatives: {
      title: "Projeleri ve destanları tek bir yerden takip edin",
      description:
        "İlgili projeleri ve destanları gruplamak ve izlemek için girişimleri kullanın. İlerlemeyi, öncelikleri ve sonuçları görün—hepsi tek bir ekrandan.",
      cta_primary: "Girişim Oluştur",
    },
    customers: {
      title: "Müşterileriniz için önemli olan şeye göre çalışmayı yönetin",
      description:
        "Müşteri isteklerini iş öğelerine getirin, isteklere göre öncelik atayın ve iş öğelerinin durumlarını müşteri kayıtlarına yuvarlayın. Yakında, müşteri özniteliklerine göre daha da iyi iş yönetimi için CRM veya Destek aracınızla entegre olacaksınız.",
      cta_primary: "Müşteri kaydı oluştur",
    },
    dashboard: {
      title: "İlerlemenizi kontrol panelleriyle görselleştirin",
      description:
        "Metrikleri takip etmek, sonuçları ölçmek ve içgörüleri etkili bir şekilde sunmak için özelleştirilebilir kontrol panelleri oluşturun.",
      cta_primary: "Yeni kontrol paneli oluştur",
    },
    wiki: {
      title: "Bir not, bir belge veya tam bir bilgi tabanı yazın.",
      description:
        "Sayfalar Plane'de düşünce yakalama alanıdır. Toplantı notları alın, kolayca biçimlendirin, iş öğelerini yerleştirin, bir bileşenler kütüphanesi kullanarak düzenleyin ve hepsini projenizin bağlamında tutun.",
      cta_primary: "Sayfanızı oluşturun",
    },
    project_overview_state_sidebar: {
      title: "Proje durumlarını etkinleştir",
      description:
        "Durum, öncelik, bitiş tarihleri ve daha fazlası gibi özellikleri görüntülemek ve yönetmek için Proje Durumlarını etkinleştirin.",
    },
  },
  settings_empty_state: {
    estimates: {
      title: "Henüz tahmin yok",
      description: "Ekibinizin çabayı nasıl ölçtüğünü tanımlayın ve tüm iş öğelerinde tutarlı bir şekilde takip edin.",
      cta_primary: "Tahmin sistemi ekle",
    },
    labels: {
      title: "Henüz etiket yok",
      description:
        "İş öğelerinizi etkili bir şekilde kategorize etmek ve yönetmek için kişiselleştirilmiş etiketler oluşturun.",
      cta_primary: "İlk etiketinizi oluşturun",
    },
    exports: {
      title: "Henüz dışa aktarma yok",
      description: "Şu anda hiç dışa aktarma kaydınız yok. Verileri dışa aktardığınızda tüm kayıtlar burada görünecek.",
    },
    tokens: {
      title: "Henüz Kişisel token yok",
      description:
        "Çalışma alanınızı harici sistemler ve uygulamalarla bağlamak için güvenli API token'ları oluşturun.",
      cta_primary: "API token'ı ekle",
    },
    workspace_tokens: {
      title: "Henüz Erişim token'ı yok",
      description:
        "Çalışma alanınızı harici sistemler ve uygulamalarla bağlamak için güvenli API token'ları oluşturun.",
      cta_primary: "Erişim token'ı ekle",
    },
    webhooks: {
      title: "Henüz Webhook eklenmedi",
      description: "Proje olayları gerçekleştiğinde harici hizmetlere bildirimleri otomatikleştirin.",
      cta_primary: "Webhook ekle",
    },
    teamspace: {
      title: "Henüz ekip alanı yok",
      description:
        "İlerlemeyi, iş yükünü ve etkinliği zahmetsizce takip etmek için üyelerinizi bir ekip alanında bir araya getirin. Daha fazla bilgi edinin",
      cta_primary: "Ekip alanı ekle",
    },
    work_item_types: {
      title: "İş öğesi türleri oluşturun ve özelleştirin",
      description:
        "Projeniz için benzersiz iş öğesi türleri tanımlayın. Her tür, projenizin ve ekibinizin ihtiyaçlarına göre uyarlanmış kendi özellikleri, iş akışları ve alanlarına sahip olabilir.",
      cta_primary: "Etkinleştir",
    },
    work_item_type_properties: {
      title:
        "Bu iş öğesi türü için yakalamak istediğiniz özelliği ve ayrıntıları tanımlayın. Projenizin iş akışına uyacak şekilde özelleştirin.",
      cta_secondary: "Özellik ekle",
    },
    epic_setting: {
      title: "Destanları Etkinleştir",
      description:
        "İlgili iş öğelerini birden fazla döngü ve modülü kapsayan daha büyük gövdelere gruplayın - büyük resim ilerlemesini takip etmek için mükemmel.",
      cta_primary: "Etkinleştir",
    },
    templates: {
      title: "Henüz şablon yok",
      description:
        "İş öğeleri ve sayfalar için şablonlar oluşturarak kurulum süresini azaltın — ve saniyeler içinde yeni çalışmaya başlayın.",
      cta_primary: "İlk şablonunuzu oluşturun",
    },
    recurring_work_items: {
      title: "Henüz yinelenen iş öğesi yok",
      description:
        "Tekrarlanan görevleri otomatikleştirmek ve zahmetsizce programa sadık kalmak için yinelenen iş öğeleri ayarlayın.",
      cta_primary: "Yinelenen iş öğesi oluştur",
    },
    worklogs: {
      title: "Tüm üyeler için zaman çizelgelerini takip edin",
      description:
        "Projeler arasında herhangi bir ekip üyesi için ayrıntılı zaman çizelgelerini görmek için iş öğelerinde zaman kaydedin.",
    },
    customers_setting: {
      title: "Başlamak için müşteri yönetimini etkinleştirin.",
      cta_primary: "Etkinleştir",
    },
    template_setting: {
      title: "Henüz şablon yok",
      description:
        "Projeler, iş öğeleri ve sayfalar için şablonlar oluşturarak kurulum süresini azaltın — ve saniyeler içinde yeni çalışmaya başlayın.",
      cta_primary: "Şablon oluştur",
    },
  },
} as const;
