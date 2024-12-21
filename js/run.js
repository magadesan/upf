const zpu = Z80({ mem_read, mem_write, io_read, io_write });
let m_mem_mapping = new Uint8Array(65536).fill(255);
let m_io_mapping = new Uint8Array(256).fill(0);
mem_write(0, 0x10);
mem_write(1, 0x20);

let fileContent;
let debug = false;
// Start the process of loading the file and logging the content
const fileUrl = '../mpf-1b.hex';
logFileContent(fileUrl);

async function logFileContent(fileUrl) {
    await fetchFileAndLog(fileUrl);
    parseIntelHex(fileContent, m_mem_mapping);
    m_mem_mapping[0x63a]=0;
    m_mem_mapping[0x63b]=0;
}

function mem_read(address) {
    if ((address & 0xffff) === address) {
        return m_mem_mapping[address];
    }
    console.error("No Mem replied to memory read: " + address);
    return 0;
}

function mem_write(address, value) {
    if ((address & 0xffff) === address && (value & 0xff) === value) {
        m_mem_mapping[address] = value;
    } else {
        console.error(`Invalid memory write at: ${address} value: ${value}`);
    }
}

function io_read(address) {
    if (debug) {
        console.log("Read: " + decimalToHex(address & 0xff));
    }
    return m_io_mapping[address & 0xff];
}

let seg = {
    a: "white", b: "white", c: "white", d: "white", 
    e: "white", f: "white", g: "white", dp: "white"
};

let run_digit = "";

// Refactored io_write function
function io_write(address, value) {
    if (debug) {
        console.log(`${toHex(address, 4)}:${decimalToHex(value)}`);
    }

    m_io_mapping[address & 0xff] = value & 0xff;

    switch (address & 0xff) {
        case 0x02:
            handleRunDigit(value);
            break;
        case 0x01:
            updateSegmentDisplay(value);
            break;
    }

    if (run_digit) {
        updateSVGDisplay();
    }
}

// Extracted functions for clarity and maintainability
function handleRunDigit(value) {
    const mapping = {
        0x01: "svg-object-data0",
        0x02: "svg-object-data1",
        0x04: "svg-object-add0",
        0x08: "svg-object-add1",
        0x10: "svg-object-add2",
        0x20: "svg-object-add3"
    };

    const segment = value & 0x3f;
    run_digit = mapping[segment] || "";
    if (debug && run_digit) {
        console.log(`run_digit: ${run_digit} value: ${decimalToHex(value)}`);
    }
}

function updateSegmentDisplay(value) {
    const segmentMap = {
        0x01: 'e', 0x02: 'g', 0x04: 'f', 0x08: 'a', 
        0x10: 'b', 0x20: 'c', 0x40: 'dp', 0x80: 'd'
    };

    for (let mask in segmentMap) {
        const segment = segmentMap[mask];
        seg[segment] = (value & mask) ? "red" : "white";
    }

    if (debug) {
        console.log(`Segment Values: ${JSON.stringify(seg)}`);
    }
}

function updateSVGDisplay() {
    if (!document.getElementById(run_digit)) return;

    const svg = document.getElementById(run_digit).contentDocument;
    for (let segment in seg) {
        const elem = svg.getElementById(segment);
        if (elem) {
            elem.setAttribute("fill", seg[segment]);
        }
    }

    if (debug) {
        console.log(`Updated SVG for: ${run_digit} with colors: ${JSON.stringify(seg)}`);
    }
}

// Fetch and log file content
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
