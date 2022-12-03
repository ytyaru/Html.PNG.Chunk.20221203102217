export class PngDecoder { // https://developer.mozilla.org/ja/docs/Web/JavaScript/Typed_arrays
    SIG = [137,80,78,71,13,10,26,10]
    constructor() {}
    async decode(blob) {
        if (! await this.isPng(blob)) { throw new Error(`PNG形式でない。先頭8バイトのシグネチャが不正値です。`) }
        const dataView = new DataView(await blob.arrayBuffer())
        console.log(`PNGです`); 
        const chunks = []
        let isLoop = true
        let offset = SIG.length
        while (isLoop) {
            const chunk = Chunk.read(dataView, offset)
            if ('IEND'===chunk[1]) { break; }
            offset += 12 + chunk[0]
            chunks.push(chunk)
        }
        return chunks
    }
    async isPng(blob) { // blob/file PNGファイルシグネチャがあるか
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
}
class Chunk {
    static read(dataView, offset) {
        const length = dataView.getUint32(offset)
        const type = new TextDecoder('ascii').decode(new Uint8Array([
            dataView.getUint8(offset + 4),
            dataView.getUint8(offset + 5),
            dataView.getUint8(offset + 6),
            dataView.getUint8(offset + 7),
        ]))
        const crc = dataView.getUint32(offset + 8 + length)
        return [length, type, crc]
    }
    /*
    constructor(dataView) { this._dataView = dataView }
    read(offset) {
        this.length = this.dataView.getUint32(offset)
        this.type = new TextDecoder('ascii').decode(new Uint8Array([
            this._dataView.getUint8(SIG_SZ + 4),
            this._dataView.getUint8(SIG_SZ + 5),
            this._dataView.getUint8(SIG_SZ + 6),
            this._dataView.getUint8(SIG_SZ + 7),
        ]))
        this.crc = dataView.getUint32(SIG_SZ + 21)
    }
    */
}
/*
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
*/

