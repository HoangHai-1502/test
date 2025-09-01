-- Tạo database
CREATE DATABASE myweb;
GO

USE myweb;
GO
DROP DATABASE myweb;
-- Bảng users
CREATE TABLE [users] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [fullname] NVARCHAR(255),
    [phone] NVARCHAR(255),
    [role] NVARCHAR(20), -- owner hoặc renter
    [created_at] DATETIME DEFAULT GETDATE()
);
GO

-- Bảng Auth
CREATE TABLE [Auth] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [userid] INT,
    [username] NVARCHAR(255),
    [email] NVARCHAR(255) UNIQUE,
    [password] NVARCHAR(255),
    CONSTRAINT FK_Auth_Users FOREIGN KEY ([userid]) REFERENCES [users]([id])
);
GO

-- Bảng rooms
CREATE TABLE [rooms] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [owner_id] INT,
    [title] NVARCHAR(255),
    [description] NVARCHAR(MAX),
    [address] NVARCHAR(MAX),
    [price] DECIMAL(18,2),
    [area] FLOAT,
    [available] BIT, -- SQL Server dùng BIT cho boolean
    [created_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Rooms_Users FOREIGN KEY ([owner_id]) REFERENCES [users]([id])
);
GO

-- Bảng images
CREATE TABLE [images] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [room_id] INT,
    [image_url] NVARCHAR(255),
    CONSTRAINT FK_Images_Rooms FOREIGN KEY ([room_id]) REFERENCES [rooms]([id])
);
GO

-- Bảng rental_requests
CREATE TABLE [rental_requests] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [renter_id] INT,
    [room_id] INT,
    [status] NVARCHAR(20), -- pending, accepted, rejected
    [created_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_RentalRequests_Users FOREIGN KEY ([renter_id]) REFERENCES [users]([id]),
    CONSTRAINT FK_RentalRequests_Rooms FOREIGN KEY ([room_id]) REFERENCES [rooms]([id])
);
GO

-- Bảng rentals
CREATE TABLE [rentals] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [room_id] INT,
    [renter_id] INT,
    [start_date] DATE,
    [end_date] DATE,
    [status] NVARCHAR(20), -- active, ended, canceled
    CONSTRAINT FK_Rentals_Rooms FOREIGN KEY ([room_id]) REFERENCES [rooms]([id]),
    CONSTRAINT FK_Rentals_Users FOREIGN KEY ([renter_id]) REFERENCES [users]([id])
);
GO

-- Cấp quyền cho bảng users
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.users TO [nhitt];
-- Cấp quyền cho bảng Auth
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Auth TO [nhitt];
-- Cấp quyền cho bảng rooms
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.rooms TO [nhitt];
-- Cấp quyền cho bảng images
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.images TO [nhitt];
-- Cấp quyền cho bảng rental_requests
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.rental_requests TO [nhitt];
-- Cấp quyền cho bảng rentals
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.rentals TO [nhitt];

-- Nếu muốn cho phép tạo thủ tục (optional)
GRANT EXECUTE TO [nhitt];

-- Thêm cột category kiểu NVARCHAR(50), mặc định là 'đơn'
ALTER TABLE rooms
ADD category NVARCHAR(50) NOT NULL DEFAULT 'đơn';
