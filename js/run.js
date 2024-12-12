const zpu = Z80({ mem_read, mem_write, io_read, io_write });
var m_mem_mapping = new Array(65536).fill(0);
var m_io_mapping = new Array(256).fill(0);
mem_write(0, 0x10);
mem_write(1, 0x20);
var fileContent;
async function logFileContent(fileUrl) {
    await fetchFileAndLog(fileUrl);
    parseIntelHex(fileContent, m_mem_mapping);
    //console.log(m_mem_mapping.slice(0,5).toString(16).padStart(2, '0'));
    let elam_count = 1000;
    while (elam_count-- > 0) {
        console.log("Before PC: " + zpu.getPC() + "::" + m_mem_mapping[zpu.getPC()] + "," + m_mem_mapping[zpu.getPC() + 1] + "," + m_mem_mapping[zpu.getPC() + 2] + ",");
        zpu.run_instruction();
        console.log("After PC: " + zpu.getPC());
    }
}
const fileUrl = '../mpf-1b.hex';
logFileContent(fileUrl);
/*
for (var i=0;i<32;i++) {
    console.log(m_mem_mapping[i]& 0xf);
    console.log(m_mem_mapping[i]& 0xf0);
}
*/
console.log("I am here");

function mem_read(address) {
    if ((address & 0xffff) == address)
        return m_mem_mapping[address];
    else {
        console.log("No Mem replied to memory read: " + address);
        return 0;
    }
}

function mem_write(address, value) {
    if (((address & 0xffff) == address) && ((value & 0xff) == value))
        m_mem_mapping[address] = value;
    else {
        console.log("No Mem to write at: " + address + " value: " + value);
        return 0;
    }
}


function io_read(address) {
    if ((address & 0xff) == address)
        return m_io_mapping[address];
    else {
        console.log("No device replied to i/o read: " + address);
        return 0;
    }
}

function io_write(address, value) {
    if (((address & 0xff) == address) && ((value & 0xff) == value))
        m_mem_mapping[address] = value;
    else {
        console.log("No i/o device to write at: " + address + " value: " + value);
        return 0;
    }
}

async function fetchFileAndLog(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch the file: ${response.statusText}`);
        }
        fileContent = await response.text();
    } catch (error) {
        console.error('Error fetching the file:', error);
    }
}

