function parseIntelHex(hexString, dataArrays) {
    const lines = hexString.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    for (const line of lines) {
        if (line[0] !== ':') {
            throw new Error("Invalid Intel HEX line, should start with ':'");
        }
        const length = parseInt(line.substr(1, 2), 16);    // Data length
        const address = parseInt(line.substr(3, 4), 16);   // Address
        const type = parseInt(line.substr(7, 2), 16);      // Record type
        const data = line.substr(9, length * 2);           // Data bytes (as a hex string)
        let j=0;
        for (let i = 0; i < data.length; i+=2,j++) {
            const byte = parseInt(data.substr(i, 2), 16);
            dataArrays[address + j] = byte;
        }
    }
}