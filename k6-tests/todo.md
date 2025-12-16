auth-test:
TEST-AUTH-001	User Login (happy path)	POST /api/auth/login với thông tin đăng nhập hợp lệ của người dùng test; theo dõi chuyển hướng và kiểm tra tải trang được bảo vệ	Đăng nhập thành công (200/302) và trang được bảo vệ có thể truy cập; cookie phiên (session) được đặt
TEST-AUTH-002	Login Failure (bad creds)	POST /api/auth/login với thông tin đăng nhập không hợp lệ	Đăng nhập thất bại với thông báo lỗi thích hợp hoặc 401
TEST-AUTH-003	Access Protected Page Without Auth	GET một trang được bảo vệ mà không có cookie	Nên được chuyển hướng đến trang đăng nhập hoặc hiển thị 401/403
TEST-AUTH-004	Logout	Kích hoạt đăng xuất (hành động máy chủ hoặc điểm cuối) và xác minh trang được bảo vệ không thể truy cập sau đó	Người dùng đã đăng xuất; các tuyến đường được bảo vệ yêu cầu đăng nhập lại

api-test:
TEST-API-001	Login Page Availability	GET /login và kiểm tra trạng thái và nội dung HTML mong đợi (biểu mẫu hoặc văn bản đăng nhập)	HTTP 200 và chứa GIAO DIỆN người dùng đăng nhập
TEST-API-002	Track Order Page	GET /track-order và xác thực trạng thái 200 và nội dung	HTTP 200 và chứa GIAO DIỆN người dùng theo dõi
TEST-API-003	Static Assets	Yêu cầu CSS/JS đến các điểm cuối /_next/static/... phải trả về 200 (hoặc 404 chấp nhận được trong môi trường dev)	Tài sản tĩnh tải được (200) hoặc 404 chấp nhận được cho các bản dựng động
TEST-API-004	API Health Check	Gọi trực tiếp các điểm cuối API lõi (nếu có) và kiểm tra sức khỏe của phản hồi JSON	JSON hợp lệ và trạng thái 200; đúng lược đồ mong đợi
TEST-API-005	General Throughput	Chạy nhiều lần lặp để đảm bảo máy chủ xử lý các yêu cầu mong đợi mỗi giây	Thời gian phản hồi ổn định dưới tải mong đợi; tỷ lệ lỗi thấp
			
			
stress-test:
TEST-STR-001	Sustained Ramp Up	Tăng VUs (người dùng ảo) từ từ lên mức cao nhất (như được định nghĩa trong các giai đoạn stress test) và quan sát hành vi máy chủ	Máy chủ giữ phản hồi; p(95) dưới ngưỡng; tỷ lệ lỗi thấp; không bị sập
TEST-STR-002	Sustained Peak	Duy trì tải cao nhất trong thời gian đã cấu hình	Máy chủ tiếp tục phục vụ các yêu cầu dưới tải liên tục; không cạn kiệt tài nguyên
TEST-STR-003	Recovery	Giảm tải lưu lượng và đảm bảo máy chủ phục hồi mà không bị kẹt tiến trình	Máy chủ trở về trạng thái phản hồi cơ bản
			
			
user-journey test
TEST-UJT-001	Full User Login and Navigation	Mô phỏng đăng nhập sau đó điều hướng qua các trang phổ biến (dashboard, vehicles, reception)	Người dùng có thể đăng nhập và điều hướng mà không có lỗi; các trang tải dưới ngưỡng
TEST-UJT-002	Search and Perform Action	Đăng nhập -> thực hiện tìm kiếm -> mở một xe -> tạo hoặc cập nhật một đơn sửa chữa	Các hành động thành công và lưu lại trong DB
TEST-UJT-003	End-to-End Checkout	Hoàn thành một đơn sửa chữa và xử lý thanh toán	Thanh toán được chấp nhận và đơn hàng được đánh dấu hoàn thành
			
			
spike-test:
TEST-SPK-001	Sudden Spike	Tăng nhanh người dùng từ VUs (người dùng ảo) thấp lên cao theo các giai đoạn kiểm tra tăng đột biến	Máy chủ vẫn phản hồi hoặc xuống cấp một cách duyên dáng (hết thời gian chờ > lỗi); không bị sập
TEST-SPK-002	Spike Recovery	Trở lại VUs thấp và xác minh hệ thống phục hồi	Máy chủ phục hồi về trạng thái sức khỏe cơ bản
TEST-SPK-003	External Rate Limits	Quan sát hành vi giới hạn tỷ lệ (rate-limit) trên các dịch vụ bên ngoài (nếu có)	Các dịch vụ bên ngoài phản hồi hoặc điều tiết (throttle) một cách duyên dáng
			
						
			
			
			
			
			
			