HTTP code hay dùng:

Nhóm 2xx – Thành công
    200 OK → Request thành công (GET, PUT, DELETE).
    201 Created → Tạo resource thành công (POST).
    204 No Content → Thành công nhưng không trả dữ liệu (thường dùng với DELETE).

Nhóm 3xx – Redirect
    301 Moved Permanently → Chuyển hướng vĩnh viễn.
    302 Found → Chuyển hướng tạm thời.
    304 Not Modified → Dữ liệu chưa thay đổi (thường dùng với cache).

Nhóm 4xx – Lỗi phía client
    400 Bad Request → Request sai định dạng, thiếu tham số.
    401 Unauthorized → Chưa đăng nhập hoặc token không hợp lệ.
    403 Forbidden → Không có quyền truy cập.
    404 Not Found → Không tìm thấy resource.
    409 Conflict → Trùng dữ liệu (ví dụ đăng ký email đã tồn tại).
    422 Unprocessable Entity → Request hợp lệ về cấu trúc nhưng dữ liệu không hợp lệ.

Nhóm 5xx – Lỗi phía server
    500 Internal Server Error → Lỗi chung của server.
    502 Bad Gateway → Gateway nhận phản hồi sai từ server upstream.
    503 Service Unavailable → Server quá tải hoặc đang bảo trì.
    504 Gateway Timeout → Server không trả về phản hồi kịp thời.

 Khi viết API thường dùng:
    201 Created → Đăng ký thành công
    200 → Đăng nhập thành công.
    400 → Thiếu username/password.
    401 → Sai username/password.
    500 → Lỗi kết nối database hoặc lỗi server.