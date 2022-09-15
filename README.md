# real_estate_project
#Role	Requirement
1. Admin	Quản lý người bán, người mua, bài viết, duyệt bài, quản lý comment, review
2. Người bán (Seller)	CRUD bài viết
3. Người mua (Buyer)	"Xem bài viết, liên hệ với người bán (được thì real time chatting/ đăng nhập vào để lấy thông tin liên hệ), đánh giá người bán, report người bán. Buyer có thể CRUD comment, reviews,"

#Tên Function	Requirement
1. Đăng nhập	Đăng nhập bằng email và mật khẩu đã được tạo (có validate password và email)
2. Đăng kí	Đăng kí sử dụng email, số điện thoại và mật khẩu (có validate password và email, check trùng email và số điện thoại, có validate số điện thoại hợp lệ)
3. Quên mật khẩu	Sử dụng email đã đăng kí để nhận email chứa token reset mật khẩu (có validate số điện thoại hợp lệ)
4. Tạo bài viết bán bất động sản	Bao gồm: Tiêu đề, hình ảnh, nội dung bài viết, giá, địa chỉ, số điện thoại liên hệ, thời gian đăng ( Nếu trùng địa chỉ thì không cho tạo )
5. List bài viết	Bao gồm: Tiêu đề, 1 hình ảnh, giá, địa chỉ, số điện thoại liên hệ, ngày đăng, số lượt xem. 10 record 1 page, có pagination, sort (giá, lượt xem, ngày đăng), filter (giá, địa chỉ)
6. Chi tiết bài viết	Bao gồm: Tiêu đề, tất cả hình ảnh, nội dung bài viết, giá, địa chỉ, số điện thoại liên hệ, ngày đăng, số lượt xem
7. Chỉnh sửa bài viết	Bao gồm: Tiêu đề, hình ảnh, nội dung bài viết, giá, địa chỉ, số điện thoại liên hệ, thời gian chỉnh sửa. Nếu có người chỉnh sửa trước thì sẽ không chỉnh sửa được, nếu địa chỉ mới update trùng với địa chỉ đã có trong DB thì không cho update
8. Xóa bài viết	Xóa bài viết được chọn
9. Tìm kiếm bài viết	Tìm kiếm theo title, content
	
