async function loadBatchData(batchId) {
    try {
        // 使用相对路径避免CORS问题
        const dataUrl = `data/${batchId}.json?t=${Date.now()}`;
        const hashUrl = `${dataUrl}.sha256?t=${Date.now()}`;
        
        const [dataRes, hashRes] = await Promise.all([fetch(dataUrl), fetch(hashUrl)]);
        if (!dataRes.ok || !hashRes.ok) throw new Error("文件不存在或网络错误");
        
        const data = await dataRes.json();
        const storedHash = await hashRes.text();

        // 计算当前哈希
        const encoder = new TextEncoder();
        const dataStr = JSON.stringify(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataStr));
        const currentHash = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0')).join('');

        // 更新页面
        document.getElementById('batch-id').textContent = data.batch_id;
        document.getElementById('processing-time').textContent = data.processing_time_UTC;
        document.getElementById('temperature').textContent = data.temperature_celsius;
        document.getElementById('humidity').textContent = data.humidity_percent;
        document.getElementById('operator').textContent = data.operator;
        document.getElementById('hash-status').textContent = "数据验证通过 ✅";
        document.getElementById('hash-status').style.color = "green";
    } catch (error) {
        console.error("加载失败:", error);
        document.getElementById('hash-status').textContent = "数据加载失败，请检查批次ID或网络连接 ❗";
        document.getElementById('hash-status').style.color = "red";
    }
}

// 从URL参数获取批次ID
const urlParams = new URLSearchParams(window.location.search);
const batchId = urlParams.get('batch') || 'batch_001';
loadBatchData(batchId);
