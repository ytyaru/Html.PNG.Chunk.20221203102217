//import {PngReader,IHDR} from "./png-reader.js";
import {PngDecoder} from "./png-decoder.js";
export class DropBox {
    constructor() {}
    async create() {
        var dropZone = document.getElementById('drop-zone');
        var preview = document.getElementById('preview');
        var fileInput = document.getElementById('file-input');
        var apiSelect = document.getElementById('api');

        dropZone.addEventListener('dragover', async(e)=>{
            e.stopPropagation();
            e.preventDefault();
            e.target.style.background = '#e1e7f0';
        }, false);

        dropZone.addEventListener('dragleave', async(e)=>{
            e.stopPropagation();
            e.preventDefault();
            e.target.style.background = '#ffffff';
        }, false);

        fileInput.addEventListener('change', async(e)=>{
            await previewFile(e.target.files[0]);
        });

        dropZone.addEventListener('drop', async(e)=>{
            e.stopPropagation();
            e.preventDefault();
            e.target.style.background = '#ffffff';
            var files = e.dataTransfer.files;
            if (files.length > 1) { return alert('開けるファイルは1つだけです。'); }
            fileInput.files = files;
            await previewFile(files[0]);
        }, false);

        function message(m, isAlert=false) { console.log(m); document.getElementById('is-png').textContent = m; if(isAlert){alert(m)}}
        function makeImage(file) {
            preview.innerHTML = ''
            var fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = function() {
                var img = document.createElement('img');
                img.setAttribute('src', fr.result);
                preview.appendChild(img);
            }
        }
        function makeChunkTable(chunks) {
            console.log('チャンク一覧')
            console.log('type', 'length', 'CRC')
            for (const chunk of chunks) {
                console.log(chunk[1], chunk[0], chunk[2].toString(16))
            }
            const table = document.createElement('table')
            const caption = document.createElement('caption')
            caption.textContent = 'チャンク一覧'
            table.appendChild(caption)
            const tr = document.createElement('tr')
            for (const name of ['length', 'type', 'CRC']) {
                const th = document.createElement('th')
                th.textContent = name
                tr.appendChild(th)
            }
            table.appendChild(tr)
            for (const chunk of chunks) {
                const tr = document.createElement('tr')
                const length = document.createElement('td')
                const type = document.createElement('td')
                const crc = document.createElement('td')
                length.textContent = chunk[0]
                type.textContent = chunk[1]
                crc.textContent = chunk[2].toString(16)
                tr.appendChild(length)
                tr.appendChild(type)
                tr.appendChild(crc)
                table.appendChild(tr)
            }
            document.getElementById('chunks').innerHTML = ''
            document.getElementById('chunks').appendChild(table)
        }
        async function previewFile(file) {
            try {
                const decoder = new PngDecoder()
                const chunks = await decoder.decode(file)
                message(`このファイルはPNG形式です😄`)
                makeImage(file)
                makeChunkTable(chunks)
            }
            catch(e) { message(`このファイルはPNG形式でない！`, true); return; }

            /*
            preview.innerHTML = ''
            document.getElementById('IHDR').innerHTML = ''
            const decoder = new PngDecoder()
            try {
                const chunks = await decoder.decode(file)
                message(`このファイルはPNG形式です😄`)
                console.log('チャンク一覧')
                console.log('type', 'length', 'CRC')
                for (const chunk of chunks) {
                    console.log(chunk[1], chunk[0], chunk[2].toString(16))
                }
            }
            catch(e) { message(`このファイルはPNG形式でない！`, true); return; }

            var fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = function() {
                var img = document.createElement('img');
                img.setAttribute('src', fr.result);
                preview.appendChild(img);
            }
            */




            /*
            const ihdr = new IHDR(new DataView(await file.arrayBuffer()))
            ihdr.show()
            document.getElementById('IHDR').appendChild(ihdr.toHtml())
            var fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = function() {
                var img = document.createElement('img');
                img.setAttribute('src', fr.result);
                preview.appendChild(img);
            };
            */

            /*
            const reader = new PngReader()
            if (await reader.isPng(file, apiSelect.value)) {
                message(`このファイルはPNG形式です😄`)
                const ihdr = new IHDR(new DataView(await file.arrayBuffer()))
                ihdr.show()
                document.getElementById('IHDR').appendChild(ihdr.toHtml())
                var fr = new FileReader();
                fr.readAsDataURL(file);
                fr.onload = function() {
                    var img = document.createElement('img');
                    img.setAttribute('src', fr.result);
                    preview.appendChild(img);
                };
            }
            else { message(`このファイルはPNG形式でない！`, true) }
            */
        }
    }
}

