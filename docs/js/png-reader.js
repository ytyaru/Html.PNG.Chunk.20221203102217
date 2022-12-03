export class PngReader { // https://developer.mozilla.org/ja/docs/Web/JavaScript/Typed_arrays
    constructor() {}
    async isPng(blob, api='DataView') { // blob/file PNGファイルシグネチャがあるか
        console.log(`isPng()`)
        return ('DataView'===api) ? this.isPngFromDataView(blob) : this.isPngFromTypedArray(blob)
    }
    async isPngFromDataView(blob) { // blob/file PNGファイルシグネチャがあるか
        console.log(`isPngFromDataView`)
        const SIG = [0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]
        const dv = new DataView(await blob.arrayBuffer())
        if (dv.length < SIG.length) { return false }
        for (let i=0; i<SIG.length; i++) {
            console.log(SIG[i], dv.getUint8(i))
            if (SIG[i] !== dv.getUint8(i)) { return false }
        }
        console.log(`isPng === true`)
        return true
    }
    async isPngFromTypedArray(blob) { // blob/file PNGファイルシグネチャがあるか
        console.log(`isPngFromTypedArray`)
        return this.#equalsArray([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A], new Uint8Array(await blob.arrayBuffer(), 0, 8))
    }
    #equalsArray(a, b) { // 2つの配列a,bが等しいか
        console.log(`#equalsArray`)
        console.log(a)
        console.log(b)
        if (a.length !== b.length) { return false }
        for (let i=0; i<a.length; i++) {
            if (a[i] !== b[i]) { return false }
        }
        return true
    }
}
export class IHDR {
    KEYS = ['length', 'type', 'width', 'height', 'bitDepth', 'colorType', 'compressionMethod', 'filterMethod', 'interlaceMethod', 'crc']
    constructor(dataView) {
        const SIG_SZ = 8
        this.length = dataView.getUint32(SIG_SZ)
        this.type = new TextDecoder('ascii').decode(new Uint8Array([
            dataView.getUint8(SIG_SZ + 4),
            dataView.getUint8(SIG_SZ + 5),
            dataView.getUint8(SIG_SZ + 6),
            dataView.getUint8(SIG_SZ + 7),
        ]))
        this.width = dataView.getUint32(SIG_SZ + 8)
        this.height = dataView.getUint32(SIG_SZ + 12)
        this.bitDepth = dataView.getUint8(SIG_SZ + 16)
        this.colorType = dataView.getUint8(SIG_SZ + 17)
        this.compressionMethod = dataView.getUint8(SIG_SZ + 18)
        this.filterMethod = dataView.getUint8(SIG_SZ + 19)
        this.interlaceMethod = dataView.getUint8(SIG_SZ + 20)
        this.crc = dataView.getUint32(SIG_SZ + 21)
    }
    show() {
        for (const prop of this.KEYS) { console.log(`${prop}: ${Reflect.get(this, prop)}`) }
    }
    toHtml() {
        const table = document.createElement('table')
        const caption = document.createElement('caption')
        caption.textContent = this.type
        table.appendChild(caption)
        for (const prop of this.KEYS) {
            const tr = document.createElement('tr')
            const th = document.createElement('th')
            const td = document.createElement('td')
            th.textContent = prop
            td.textContent = Reflect.get(this, prop)
            tr.appendChild(th)
            tr.appendChild(td)
            table.appendChild(tr)
        }
        return table
    }
}

