// app.js
async function loadBatchData(batchId) {
    try {
        // 从GitHub仓库获取JSON数据和哈希文件
        const dataUrl = `https://raw.githubusercontent.com/hsyr-ctq/beef_ball/main/data/${batchId}.json`;
        const hashUrl = `${dataUrl}.sha256`;
        
        // 并发请求数据和哈希
        const [dataRes, hashRes] = await Promise.all([fetch(dataUrl), fetch(hashUrl)]);
        const data = await dataRes.json();
        const storedHash = await hashRes.text();

        // 计算当前数据的哈希值
        const encoder = new TextEncoder();
        const dataStr = JSON.stringify(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataStr));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 验证哈希是否一致
        const hashValid = currentHash === storedHash;
        const hashStatusElement = document.getElementById('hash-status');
        hashStatusElement.textContent = hashValid ? "数据验证通过 ✅" : "数据可能被篡改 ❌";
        hashStatusElement.style.color = hashValid ? "green" : "red";

        // 如果验证通过，更新页面数据
        if (hashValid) {
            document.getElementById('batch-id').textContent = data.batch_id;
            document.getElementById('processing-time').textContent = data.processing_time_UTC;
            document.getElementById('temperature').textContent = data.temperature_celsius;
            document.getElementById('humidity').textContent = data.humidity_percent;
            document.getElementById('operator').textContent = data.operator;
        }
    } catch (error) {
        console.error("加载数据失败:", error);
        document.getElementById('hash-status').textContent = "数据加载失败，请稍后重试 ❗";
    }
}

// 从URL参数中获取批次ID（例如：?batch=batch_001）
const urlParams = new URLSearchParams(window.location.search);
const batchId = urlParams.get('batch') || 'batch_001'; // 默认显示批次001
loadBatchData(batchId);
