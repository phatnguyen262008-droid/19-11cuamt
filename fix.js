const fs = require('fs');
const path = require('path');

// 1. Tạo index.html tự động chuyển hướng vào thiệp
const indexContent = '<!DOCTYPE html>\n<html>\n<head>\n  <meta http-equiv="refresh" content="0; url=./b.html?39bd2b51039b9e80" />\n</head>\n<body></body>\n</html>';
fs.writeFileSync('index.html', indexContent);
console.log('✅ Đã tạo index.html');

// 2. Hàm thay thế chuỗi hàng loạt
function fixPaths(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    
    for (const [from, to] of replacements) {
        content = content.split(from).join(to);
    }
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Đã sửa đường dẫn trong: ${filePath}`);
    }
}

// 3. Đổi đường dẫn tuyệt đối thành tương đối trong b.html
fixPaths('b.html', [
    ['"/assets/', '"./assets/'],
    ["'/assets/", "'./assets/"]
]);

// 4. Sửa đường dẫn nội bộ trong tất cả file JS/CSS của dự án
const assetsDir = './assets';
if (fs.existsSync(assetsDir)) {
    fs.readdirSync(assetsDir).forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.css')) {
            fixPaths(path.join(assetsDir, file), [
                ['"/assets/', '"./assets/'],
                ["'/assets/", "'./assets/"]
            ]);
        }
    });
}

// 5. Đổi link ảnh/nhạc online thành link offline trong mock-data.json
fixPaths('mock-data.json', [
    ['https://cdn.dlove.vn/uploads/boysday/N5EyLXTcGsR4dEGFa2PsdudckVo1/', './external-media/'],
    ['https://cdn.dlove.vn/assets/trungthuv2/music/', './external-media/']
]);

console.log('🎉 Hoàn tất! Bạn có thể git add, commit và push thư mục này lên GitHub Pages.');