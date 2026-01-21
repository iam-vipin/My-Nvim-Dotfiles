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
      title: "Chưa có số liệu tiến độ để hiển thị.",
      description: "Bắt đầu đặt giá trị thuộc tính trong các mục công việc để xem số liệu tiến độ ở đây.",
    },
    updates: {
      title: "Chưa có cập nhật.",
      description: "Khi thành viên dự án thêm cập nhật, nó sẽ xuất hiện ở đây",
    },
    search: {
      title: "Không có kết quả phù hợp.",
      description: "Không tìm thấy kết quả. Hãy thử điều chỉnh các từ khóa tìm kiếm.",
    },
    not_found: {
      title: "Rất tiếc! Có vẻ như có gì đó không ổn",
      description: "Chúng tôi không thể tải tài khoản Plane của bạn hiện tại. Đây có thể là lỗi mạng.",
      cta_primary: "Thử tải lại",
    },
    server_error: {
      title: "Lỗi máy chủ",
      description:
        "Chúng tôi không thể kết nối và lấy dữ liệu từ máy chủ của chúng tôi. Đừng lo lắng, chúng tôi đang khắc phục.",
      cta_primary: "Thử tải lại",
    },
  },
  project_empty_state: {
    no_access: {
      title: "Có vẻ như bạn không có quyền truy cập vào Dự án này",
      restricted_description: "Liên hệ với quản trị viên để yêu cầu quyền truy cập và bạn có thể tiếp tục tại đây.",
      join_description: "Nhấn nút bên dưới để tham gia.",
      cta_primary: "Tham gia dự án",
      cta_loading: "Đang tham gia dự án",
    },
    invalid_project: {
      title: "Không tìm thấy dự án",
      description: "Dự án bạn đang tìm kiếm không tồn tại.",
    },
    work_items: {
      title: "Bắt đầu với mục công việc đầu tiên của bạn.",
      description:
        "Các mục công việc là những khối xây dựng của dự án của bạn — chỉ định người sở hữu, đặt mức độ ưu tiên và theo dõi tiến độ dễ dàng.",
      cta_primary: "Tạo mục công việc đầu tiên của bạn",
    },
    cycles: {
      title: "Nhóm và giới hạn thời gian công việc của bạn trong Chu kỳ.",
      description:
        "Chia nhỏ công việc thành các phần có giới hạn thời gian, làm ngược từ thời hạn dự án để đặt ngày và tạo tiến triển cụ thể như một đội.",
      cta_primary: "Đặt chu kỳ đầu tiên của bạn",
    },
    cycle_work_items: {
      title: "Không có mục công việc để hiển thị trong chu kỳ này",
      description:
        "Tạo các mục công việc để bắt đầu giám sát tiến độ của đội bạn trong chu kỳ này và đạt được mục tiêu đúng hạn.",
      cta_primary: "Tạo mục công việc",
      cta_secondary: "Thêm mục công việc hiện có",
    },
    modules: {
      title: "Ánh xạ mục tiêu dự án của bạn vào Mô-đun và theo dõi dễ dàng.",
      description:
        "Các mô-đun được tạo thành từ các mục công việc kết nối với nhau. Chúng hỗ trợ theo dõi tiến độ qua các giai đoạn dự án, mỗi giai đoạn có thời hạn và phân tích cụ thể để chỉ ra bạn gần đạt được các giai đoạn đó như thế nào.",
      cta_primary: "Đặt mô-đun đầu tiên của bạn",
    },
    module_work_items: {
      title: "Không có mục công việc để hiển thị trong Mô-đun này",
      description: "Tạo các mục công việc để bắt đầu giám sát mô-đun này.",
      cta_primary: "Tạo mục công việc",
      cta_secondary: "Thêm mục công việc hiện có",
    },
    views: {
      title: "Lưu chế độ xem tùy chỉnh cho dự án của bạn",
      description:
        "Chế độ xem là các bộ lọc đã lưu giúp bạn truy cập nhanh chóng thông tin bạn sử dụng nhiều nhất. Cộng tác dễ dàng khi các đồng đội chia sẻ và điều chỉnh chế độ xem theo nhu cầu cụ thể của họ.",
      cta_primary: "Tạo chế độ xem",
    },
    no_work_items_in_project: {
      title: "Chưa có mục công việc trong dự án",
      description:
        "Thêm các mục công việc vào dự án của bạn và chia nhỏ công việc thành các phần có thể theo dõi với chế độ xem.",
      cta_primary: "Thêm mục công việc",
    },
    work_item_filter: {
      title: "Không tìm thấy mục công việc",
      description: "Bộ lọc hiện tại của bạn không trả về kết quả nào. Hãy thử thay đổi bộ lọc.",
      cta_primary: "Thêm mục công việc",
    },
    pages: {
      title: "Ghi chép mọi thứ — từ ghi chú đến PRD",
      description:
        "Các trang cho phép bạn ghi lại và tổ chức thông tin ở một nơi. Viết ghi chú cuộc họp, tài liệu dự án và PRD, nhúng các mục công việc và cấu trúc chúng với các thành phần sẵn sàng sử dụng.",
      cta_primary: "Tạo Trang đầu tiên của bạn",
    },
    archive_pages: {
      title: "Chưa có trang được lưu trữ",
      description: "Lưu trữ các trang không nằm trong tầm quan sát của bạn. Truy cập chúng ở đây khi cần.",
    },
    intake_sidebar: {
      title: "Ghi lại yêu cầu Tiếp nhận",
      description: "Gửi các yêu cầu mới để được xem xét, ưu tiên và theo dõi trong quy trình làm việc của dự án.",
      cta_primary: "Tạo yêu cầu Tiếp nhận",
    },
    intake_main: {
      title: "Chọn một mục công việc Tiếp nhận để xem chi tiết của nó",
    },
    epics: {
      title: "Biến các dự án phức tạp thành các câu chuyện sử thi có cấu trúc.",
      description:
        "Một câu chuyện sử thi giúp bạn tổ chức các mục tiêu lớn thành các nhiệm vụ nhỏ hơn, có thể theo dõi.",
      cta_primary: "Tạo Câu chuyện Sử thi",
      cta_secondary: "Tài liệu",
    },
    epic_work_items: {
      title: "Bạn chưa thêm mục công việc vào câu chuyện sử thi này.",
      description: "Bắt đầu bằng cách thêm một số mục công việc vào câu chuyện sử thi này và theo dõi chúng ở đây.",
      cta_secondary: "Thêm mục công việc",
    },
  },
  workspace_empty_state: {
    archive_work_items: {
      title: "Chưa có mục công việc được lưu trữ",
      description:
        "Thủ công hoặc thông qua tự động hóa, bạn có thể lưu trữ các mục công việc đã hoàn thành hoặc bị hủy. Tìm chúng ở đây sau khi lưu trữ.",
      cta_primary: "Thiết lập tự động hóa",
    },
    archive_cycles: {
      title: "Chưa có chu kỳ được lưu trữ",
      description: "Để sắp xếp dự án của bạn, hãy lưu trữ các chu kỳ đã hoàn thành. Tìm chúng ở đây sau khi lưu trữ.",
    },
    archive_modules: {
      title: "Chưa có Mô-đun được lưu trữ",
      description:
        "Để sắp xếp dự án của bạn, hãy lưu trữ các mô-đun đã hoàn thành hoặc bị hủy. Tìm chúng ở đây sau khi lưu trữ.",
    },
    home_widget_quick_links: {
      title: "Giữ các tài liệu tham khảo, tài nguyên hoặc tài liệu quan trọng tiện lợi cho công việc của bạn",
    },
    inbox_sidebar_all: {
      title: "Cập nhật cho các mục công việc bạn đăng ký sẽ xuất hiện ở đây",
    },
    inbox_sidebar_mentions: {
      title: "Đề cập cho các mục công việc của bạn sẽ xuất hiện ở đây",
    },
    your_work_by_priority: {
      title: "Chưa có mục công việc được giao",
    },
    your_work_by_state: {
      title: "Chưa có mục công việc được giao",
    },
    views: {
      title: "Chưa có Chế độ xem",
      description:
        "Thêm các mục công việc vào dự án của bạn và sử dụng chế độ xem để lọc, sắp xếp và giám sát tiến độ dễ dàng.",
      cta_primary: "Thêm mục công việc",
    },
    drafts: {
      title: "Các mục công việc viết dở",
      description:
        "Để thử điều này, hãy bắt đầu thêm một mục công việc và để nó ở giữa chừng hoặc tạo bản nháp đầu tiên của bạn bên dưới. 😉",
      cta_primary: "Tạo mục công việc nháp",
    },
    projects_archived: {
      title: "Không có dự án được lưu trữ",
      description: "Có vẻ như tất cả các dự án của bạn vẫn đang hoạt động—làm tốt lắm!",
    },
    analytics_projects: {
      title: "Tạo dự án để trực quan hóa số liệu dự án ở đây.",
    },
    analytics_work_items: {
      title:
        "Tạo dự án với các mục công việc và người được giao để bắt đầu theo dõi hiệu suất, tiến độ và tác động của đội ở đây.",
    },
    analytics_no_cycle: {
      title:
        "Tạo chu kỳ để tổ chức công việc thành các giai đoạn có giới hạn thời gian và theo dõi tiến độ qua các sprint.",
    },
    analytics_no_module: {
      title: "Tạo mô-đun để tổ chức công việc của bạn và theo dõi tiến độ qua các giai đoạn khác nhau.",
    },
    analytics_no_intake: {
      title: "Thiết lập tiếp nhận để quản lý các yêu cầu đến và theo dõi cách chúng được chấp nhận và từ chối",
    },
    home_widget_stickies: {
      title: "Ghi lại một ý tưởng, ghi lại khoảnh khắc sáng tạo hoặc ghi lại ý nghĩ. Thêm ghi chú dán để bắt đầu.",
    },
    stickies: {
      title: "Ghi lại ý tưởng ngay lập tức",
      description:
        "Tạo ghi chú dán cho các ghi chú nhanh và việc cần làm, và mang chúng theo bên mình mọi nơi bạn đến.",
      cta_primary: "Tạo ghi chú dán đầu tiên",
      cta_secondary: "Tài liệu",
    },
    active_cycles: {
      title: "Không có chu kỳ hoạt động",
      description:
        "Bạn không có chu kỳ đang tiến hành ngay bây giờ. Các chu kỳ hoạt động xuất hiện ở đây khi chúng bao gồm ngày hôm nay.",
    },
    teamspaces: {
      title: "Với không gian nhóm, mở khóa tổ chức và theo dõi tốt hơn",
      description:
        "Tạo một bề mặt chuyên dụng cho mỗi đội thực tế, tách biệt khỏi tất cả các bề mặt làm việc khác trong Plane và tùy chỉnh chúng để phù hợp với cách đội của bạn làm việc.",
      cta_primary: "Tạo Không gian Nhóm mới",
    },
    initiatives: {
      title: "Theo dõi các dự án và câu chuyện sử thi từ một nơi",
      description:
        "Sử dụng sáng kiến để nhóm và giám sát các dự án và câu chuyện sử thi liên quan. Xem tiến độ, ưu tiên và kết quả—tất cả từ một màn hình duy nhất.",
      cta_primary: "Tạo Sáng kiến",
    },
    customers: {
      title: "Quản lý công việc theo những gì quan trọng với khách hàng của bạn",
      description:
        "Đưa yêu cầu của khách hàng vào các mục công việc, gán mức độ ưu tiên theo yêu cầu và tổng hợp trạng thái của các mục công việc vào hồ sơ khách hàng. Sớm, bạn sẽ tích hợp với công cụ CRM hoặc Hỗ trợ của mình để quản lý công việc tốt hơn theo thuộc tính khách hàng.",
      cta_primary: "Tạo hồ sơ khách hàng",
    },
    dashboard: {
      title: "Trực quan hóa tiến độ của bạn với bảng điều khiển",
      description:
        "Xây dựng bảng điều khiển có thể tùy chỉnh để theo dõi số liệu, đo lường kết quả và trình bày thông tin hiệu quả.",
      cta_primary: "Tạo bảng điều khiển mới",
    },
    wiki: {
      title: "Viết một ghi chú, một tài liệu hoặc một cơ sở kiến thức đầy đủ.",
      description:
        "Các trang là không gian ghi lại suy nghĩ trong Plane. Ghi chú cuộc họp, định dạng chúng dễ dàng, nhúng các mục công việc, bố trí chúng bằng thư viện các thành phần và giữ chúng tất cả trong bối cảnh dự án của bạn.",
      cta_primary: "Tạo trang của bạn",
    },
    project_overview_state_sidebar: {
      title: "Kích hoạt trạng thái dự án",
      description:
        "Kích hoạt Trạng thái Dự án để xem và quản lý các thuộc tính như trạng thái, mức độ ưu tiên, ngày đến hạn và hơn thế nữa.",
    },
  },
  settings_empty_state: {
    estimates: {
      title: "Chưa có ước tính",
      description:
        "Xác định cách đội của bạn đo lường nỗ lực và theo dõi nó một cách nhất quán trên tất cả các mục công việc.",
      cta_primary: "Thêm hệ thống ước tính",
    },
    labels: {
      title: "Chưa có nhãn",
      description: "Tạo nhãn cá nhân hóa để phân loại và quản lý các mục công việc của bạn một cách hiệu quả.",
      cta_primary: "Tạo nhãn đầu tiên của bạn",
    },
    exports: {
      title: "Chưa có xuất khẩu",
      description:
        "Bạn chưa có bản ghi xuất khẩu nào ngay bây giờ. Sau khi bạn xuất dữ liệu, tất cả các bản ghi sẽ xuất hiện ở đây.",
    },
    tokens: {
      title: "Chưa có token Cá nhân",
      description:
        "Tạo token API an toàn để kết nối không gian làm việc của bạn với các hệ thống và ứng dụng bên ngoài.",
      cta_primary: "Thêm token API",
    },
    webhooks: {
      title: "Chưa thêm Webhook",
      description: "Tự động hóa thông báo đến các dịch vụ bên ngoài khi sự kiện dự án xảy ra.",
      cta_primary: "Thêm webhook",
    },
    teamspace: {
      title: "Chưa có không gian nhóm",
      description:
        "Tập hợp các thành viên của bạn trong một không gian nhóm để theo dõi tiến độ, khối lượng công việc và hoạt động - một cách dễ dàng. Tìm hiểu thêm",
      cta_primary: "Thêm không gian nhóm",
    },
    work_item_types: {
      title: "Tạo và tùy chỉnh các loại mục công việc",
      description:
        "Xác định các loại mục công việc độc đáo cho dự án của bạn. Mỗi loại có thể có thuộc tính, quy trình làm việc và trường riêng - được điều chỉnh theo nhu cầu của dự án và đội của bạn.",
      cta_primary: "Kích hoạt",
    },
    work_item_type_properties: {
      title:
        "Xác định thuộc tính và chi tiết bạn muốn thu thập cho loại mục công việc này. Tùy chỉnh nó để phù hợp với quy trình làm việc của dự án.",
      cta_secondary: "Thêm thuộc tính",
    },
    epic_setting: {
      title: "Kích hoạt Câu chuyện Sử thi",
      description:
        "Nhóm các mục công việc liên quan thành các thực thể lớn hơn trải dài qua nhiều chu kỳ và mô-đun - hoàn hảo để theo dõi tiến độ tổng thể.",
      cta_primary: "Kích hoạt",
    },
    templates: {
      title: "Chưa có mẫu",
      description:
        "Giảm thời gian thiết lập bằng cách tạo mẫu cho các mục công việc và trang — và bắt đầu công việc mới trong vài giây.",
      cta_primary: "Tạo mẫu đầu tiên của bạn",
    },
    recurring_work_items: {
      title: "Chưa có mục công việc định kỳ",
      description:
        "Thiết lập các mục công việc định kỳ để tự động hóa các nhiệm vụ lặp lại và giữ đúng lịch trình một cách dễ dàng.",
      cta_primary: "Tạo mục công việc định kỳ",
    },
    worklogs: {
      title: "Theo dõi bảng chấm công cho tất cả thành viên",
      description:
        "Ghi nhật ký thời gian trên các mục công việc để xem bảng chấm công chi tiết cho bất kỳ thành viên nào trong đội qua các dự án.",
    },
    customers_setting: {
      title: "Kích hoạt quản lý khách hàng để bắt đầu.",
      cta_primary: "Kích hoạt",
    },
    template_setting: {
      title: "Chưa có mẫu",
      description:
        "Giảm thời gian thiết lập bằng cách tạo mẫu cho dự án, mục công việc và trang — và bắt đầu công việc mới trong vài giây.",
      cta_primary: "Tạo mẫu",
    },
  },
} as const;
