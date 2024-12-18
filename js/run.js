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
    console.log("Read:" + decimalToHex(address & 0xff));
    return m_io_mapping[address & 0xff];
}

/*
dPcbafge
*/
var seg_a = "";
var seg_b = "";
var seg_c = "";
var seg_d = "";
var seg_e = "";
var seg_f = "";
var seg_g = "";
var seg_dp = "";
var run_digit = "";
function io_write(address, value) {
    m_io_mapping[address & 0xff] = value & 0xff;
    if ((address & 0xff) == 0x02 && ((value & 0x3f) != 0)) {
        switch (value & 0x3f) {
            case 0x01:
                run_digit = "svg-object-data0"; break;
            case 0x02:
                run_digit = "svg-object-data1"; break;
            case 0x04:
                run_digit = "svg-object-add0"; break;
            case 0x08:
                run_digit = "svg-object-add1"; break;
            case 0x10:
                run_digit = "svg-object-add2"; break;
            case 0x20:
                run_digit = "svg-object-add3";break;
        }
    }
    if ((address & 0xff) == 0x01) {
        if ((value && 0x01) == 0x01)
            seg_e = "red";
        else
            seg_e = "white";
        if ((value && 0x02) == 0x02)
            seg_g = "red";
        else
            seg_g = "white";
        if ((value && 0x04) == 0x04)
            seg_f = "red";
        else
            seg_f = "white";
        if ((value && 0x08) == 0x08)
            seg_a = "red";
        else
            seg_a = "white";
        if ((value && 0x10) == 0x10)
            seg_b = "red";
        else
            seg_b = "white";
        if ((value && 0x20) == 0x20)
            seg_c = "red";
        else
            seg_c = "white";
        if ((value && 0x40) == 0x40)
            seg_dp = "red";
        else
            seg_dp = "white";
        if ((value && 0x80) == 0x80)
            seg_d = "red";
        else
            seg_d = "white";
    }
    if (run_digit != "") {
        document.getElementById(run_digit).contentDocument.getElementById("a").setAttribute("fill", seg_a);
        document.getElementById(run_digit).contentDocument.getElementById("b").setAttribute("fill", seg_b);
        document.getElementById(run_digit).contentDocument.getElementById("c").setAttribute("fill", seg_c);
        document.getElementById(run_digit).contentDocument.getElementById("d").setAttribute("fill", seg_d);
        document.getElementById(run_digit).contentDocument.getElementById("e").setAttribute("fill", seg_e);
        document.getElementById(run_digit).contentDocument.getElementById("f").setAttribute("fill", seg_f);
        document.getElementById(run_digit).contentDocument.getElementById("g").setAttribute("fill", seg_g);
        document.getElementById(run_digit).contentDocument.getElementById("dp").setAttribute("fill", seg_dp);
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

