export function getExt(name: string){
    const mtc = name.match(/\.([A-Za-z]+)$/)
    let ext = mtc ? mtc[1] : null
    if(ext === 'jpg'){
        ext = 'jpeg'
    }
    return `image/${ext}`
}

export async function arrayToDataUrl(data: ArrayBuffer, type: string): Promise<string>{
    const blob = new Blob([data],{type});
    const reader = new FileReader();
    return await new Promise((resolve, reject) => {
        reader.onload = function(evt){
            if(!evt.target){
                reject(evt)
            }else{
                var dataurl: any = evt.target.result;
                resolve(dataurl);
            }
        }
        reader.readAsDataURL(blob)
    })
}