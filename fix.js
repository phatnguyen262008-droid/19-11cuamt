const fs = require('fs');
const path = require('path');

// Tên repo GitHub của bạn
const REPO_NAME = '19-11cuamt'; 

function fixPaths(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    for (const [from, to] of replacements) {
        content = content.split(from).join(to);
    }
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
    }
}

// 1. Sửa toàn bộ JS, CSS sang đường dẫn tuyệt đối của repo
const assetsDir = './assets';
if (fs.existsSync(assetsDir)) {
    fs.readdirSync(assetsDir).forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.css')) {
            fixPaths(path.join(assetsDir, file), [
                ['"/assets/', `"/${REPO_NAME}/assets/`],
                ['"./assets/', `"/${REPO_NAME}/assets/`],
                ["'/assets/", `'/${REPO_NAME}/assets/`],
                ["'./assets/", `'/${REPO_NAME}/assets/`]
            ]);
        }
    });
}

// 2. Sửa đường dẫn ảnh/nhạc trong mock-data.json
fixPaths('mock-data.json', [
    ['https://cdn.dlove.vn/uploads/boysday/N5EyLXTcGsR4dEGFa2PsdudckVo1/', `/${REPO_NAME}/external-media/`],
    ['./external-media/', `/${REPO_NAME}/external-media/`],
    ['https://cdn.dlove.vn/assets/trungthuv2/music/', `/${REPO_NAME}/external-media/`]
]);

// 3. Sửa b.html: Chèn kịch bản chặn đổi URL và ép đọc đúng data
if (fs.existsSync('b.html')) {
    let htmlContent = fs.readFileSync('b.html', 'utf-8');
    htmlContent = htmlContent.split('"/assets/').join(`"/${REPO_NAME}/assets/`)
                             .split('"./assets/').join(`"/${REPO_NAME}/assets/`);

    const interceptorScript = `
    <script>
      // Chặn lỗi 404 khi web tự đổi URL
      const _origPush = window.history.pushState;
      window.history.pushState = function(state, title, url) {
          if (typeof url === 'string' && url.startsWith('/')) url = '/${REPO_NAME}' + url;
          return _origPush.call(this, state, title, url);
      };
      const _origReplace = window.history.replaceState;
      window.history.replaceState = function(state, title, url) {
          if (typeof url === 'string' && url.startsWith('/')) url = '/${REPO_NAME}' + url;
          return _origReplace.call(this, state, title, url);
      };

      // Đọc đúng file data tuyệt đối
      const _origFetch = window.fetch;
      window.fetch = async function(resource, config) {
        const urlStr = typeof resource === 'string' ? resource : resource.url;
        if (urlStr.includes('/api/') || urlStr.includes('dlove.vn')) {
          return _origFetch('/${REPO_NAME}/mock-data.json');
        }
        return _origFetch(resource, config);
      };
    </script>`;

    htmlContent = htmlContent.replace(/<script>[\s\S]*?_origFetch[\s\S]*?<\/script>/, '');
    htmlContent = htmlContent.replace('<head>', '<head>' + interceptorScript);
    fs.writeFileSync('b.html', htmlContent, 'utf-8');
    
    // 4. Nhân bản b.html thành boysday.html để F5 không bị lỗi 404
    fs.copyFileSync('b.html', 'boysday.html');
}

// 5. Tạo index.html tự động chuyển hướng chuẩn
const indexContent = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/${REPO_NAME}/b.html?39bd2b51039b9e80" /></head><body></body></html>`;
fs.writeFileSync('index.html', indexContent);

console.log('✅ Đã fix xong toàn bộ đường dẫn bảo vệ cho GitHub Pages!');