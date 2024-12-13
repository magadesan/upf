const zpu = Z80({ mem_read, mem_write, io_read, io_write });
var m_mem_mapping = new Uint8Array(65536).fill(255);
var m_io_mapping = new Uint8Array(256).fill(0);
mem_write(0, 0x10);
mem_write(1, 0x20);
var fileContent;
async function logFileContent(fileUrl) {
    await fetchFileAndLog(fileUrl);
    parseIntelHex(fileContent, m_mem_mapping);
}
const fileUrl = '../mpf-1b.hex';
logFileContent(fileUrl);

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

