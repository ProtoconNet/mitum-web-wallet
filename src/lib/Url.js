function download(json) {
    if (!json || !Object.prototype.hasOwnProperty.call(json, 'hash')) {
        return undefined;
    }

    let file;
    try {
        file = new File([JSON.stringify(json, null, 4)], `${json.hash}`, { type: 'application/json' });
    } catch (e) {
        alert('JSON 파일 다운로드 url을 얻을 수 없습니다. :(');
        return undefined;
    }

    return URL.createObjectURL(file);
}

export default download;