// Function to format the register value as hex
function toHex(value, length) {
    // Ensure the value is a number
    if (typeof value !== 'number') {
        value = Number(value);
    }

    if (isNaN(value)) {
        console.error("Invalid value passed:", value);
        return "Invalid";
    }

    return value.toString(16).toUpperCase().padStart(length, '0');
}
function decimalToHex(number, bytes = 1) {
    const hexDigits = "0123456789ABCDEF";  // Hexadecimal digits
    let hexString = '';

    // Handle edge case for zero
    if (number === 0) {
        return '0'.padStart(bytes * 2, '0');  // Ensure correct length
    }

    // Ensure the number fits within the specified byte range
    const maxValue = Math.pow(256, bytes) - 1;
    if (number < 0 || number > maxValue) {
        throw new Error(`Number out of range for ${bytes}-byte input.`);
    }

    // Convert to hexadecimal
    while (number > 0) {
        let remainder = number % 16;
        hexString = hexDigits[remainder] + hexString;  // Prepend hex digit
        number = Math.floor(number / 16);  // Divide by 16
    }

    // Pad with leading zeros if necessary
    return hexString.padStart(bytes * 2, '0');
}
// Function to display the Z80 registers using term.write
function displayRegisters() {
    const state = zpu.getState(); // Get the current state

    // Prepare a compact output for registers
    const registerList = [
        { label: 'A', value: state.a, length: 2 },
        { label: 'B', value: state.b, length: 2 },
        { label: 'C', value: state.c, length: 2 },
        { label: 'D', value: state.d, length: 2 },
        { label: 'E', value: state.e, length: 2 },
        { label: 'H', value: state.h, length: 2 },
        { label: 'L', value: state.l, length: 2 },
        { label: 'A\'', value: state.a_prime, length: 2 },
        { label: 'B\'', value: state.b_prime, length: 2 },
        { label: 'C\'', value: state.c_prime, length: 2 },
        { label: 'D\'', value: state.d_prime, length: 2 },
        { label: 'E\'', value: state.e_prime, length: 2 },
        { label: 'H\'', value: state.h_prime, length: 2 },
        { label: 'L\'', value: state.l_prime, length: 2 },
        { label: 'IX', value: state.ix, length: 4 },
        { label: 'IY', value: state.iy, length: 4 },
        { label: 'I', value: state.i, length: 2 },
        { label: 'R', value: state.r, length: 2 },
        { label: 'SP', value: state.sp, length: 4 },
        { label: 'PC', value: state.pc, length: 4 }
    ];

    // Prepare flags
    const flags = `S: ${state.flags.S}, Z: ${state.flags.Z}, Y: ${state.flags.Y}, H: ${state.flags.H}, ` +
        `X: ${state.flags.X}, P: ${state.flags.P}, N: ${state.flags.N}, C: ${state.flags.C}`;

    const flagsPrime = `S: ${state.flags_prime.S}, Z: ${state.flags_prime.Z}, Y: ${state.flags_prime.Y}, H: ${state.flags_prime.H}, ` +
        `X: ${state.flags_prime.X}, P: ${state.flags_prime.P}, N: ${state.flags_prime.N}, C: ${state.flags_prime.C}`;

    // Prepare register display in chunks to fit 80 characters
    let line = '\n\r';
    registerList.forEach((reg, index) => {
        const regStr = `${reg.label}:${toHex(reg.value, reg.length)}`;
        if (line.length + regStr.length + 1 <= 80) {
            line += regStr + ' ';
        } else {
            term.write(line.trim() + '\n\r');
            line = regStr + ' '; // Start new line
        }

        // After last register, output the remaining line
        if (index === registerList.length - 1) {
            term.write(line.trim() + '\n\r');
        }
    });

    // Output flags in a single line
    term.write(`Flags: ${flags}\n\r`);
    term.write(`Flags' (Prime): ${flagsPrime}`);
}
function displayMemorySubset(start, end) {
    // Validate start and end indexes
    if (start < 0 || start >= end) {
        term.write("Invalid range!\n");
        return;
    }

    // Iterate over the specified range of memory and print in chunks of 16 bytes
    for (let i = start; i < end; i += 16) {
        // Print the memory address in hexadecimal
        term.write(i.toString(16).padStart(4, '0').toUpperCase() + "  ");

        // Print up to 16 bytes in hexadecimal format
        for (let j = 0; j < 16 && i + j < end; j++) {
            term.write(decimalToHex(m_mem_mapping[i + j]) + " ");
        }

        // Print the ASCII representation of the bytes
        term.write("  ");
        for (let j = 0; j < 16 && i + j < end; j++) {
            let byte = m_mem_mapping[i + j];
            if (byte >= 32 && byte <= 126) {
                term.write(String.fromCharCode(byte));  // Printable ASCII characters
            } else {
                term.write(".");  // Non-printable characters as a dot
            }
        }

        if(i<end-16) term.write("\n\r"); // Move to the next line after printing 16 bytes
    }
}
