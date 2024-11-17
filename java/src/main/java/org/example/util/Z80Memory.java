package org.example.util;
/*
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import com.codingrodent.microprocessor.IMemory;
import com.codingrodent.microprocessor.Z80.CPUConstants;
import com.codingrodent.microprocessor.Z80.Utilities;
import com.codingrodent.microprocessor.Z80.Z80Core;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public class Z80Memory implements IMemory {
    private final int[] memory = new int[65536];

    public Z80Memory() {

    }

    /**
     * Read a standard tape dump file into an array and return
     *
     * @param fileName The file to read
     * @throws IOException Thrown if a failure occurs while reading the file
     */
    public void readHexDumpFile(String fileName) throws IOException {
        String line;
        int address, base;
        LineNumberReader source = new LineNumberReader(new InputStreamReader(new FileInputStream(fileName), StandardCharsets.UTF_8));
        //
        boolean firstTime = true;
        while (true) { // read a line

            String inputLine = source.readLine();
            if ((null == inputLine) || (inputLine.charAt(0) == '.')) {
                break;
            }
            line = inputLine.trim();
            // System.out.println("<" + line + ">");

            // convert and place into memory
            address = Utilities.getHexValue(line.substring(0, 4));
            // System.out.println("Address : " + address + " : " + line.substring(0, 4));
            if (firstTime) {
                firstTime = false;
            }
            base = 5;
            for (int i = 0; i < 8; i++) {
                int value = Utilities.getHexValue(line.substring(base, base + 2));
                memory[address] = value;
                base = base + 3;
                address++;
            }
        }
        source.close();
        System.out.println("File read "+fileName);
    }

    public void setMemory(BufferedReader reader) throws IOException {
        String line;
        int address, base;
        //
        boolean firstTime = true;
        while (true) { // read a line

            String inputLine = reader.readLine();
            if ((null == inputLine) || (inputLine.charAt(0) == '.')) {
                break;
            }
            line = inputLine.trim();
            // System.out.println("<" + line + ">");

            // convert and place into memory
            try {
                address = Utilities.getHexValue(line.substring(0, 4));
            } catch (Exception e) {
                address = 0;
            }
            // System.out.println("Address : " + address + " : " + line.substring(0, 4));
            if (firstTime) {
                firstTime = false;
            }
            base = 5;
            for (int i = 0; i < 8; i++) {
                int value;
                try {
                    value = Utilities.getHexValue(line.substring(base, base + 2));
                } catch (Exception e) {
                    value = 0;
                }
                memory[address] = value;
                base = base + 3;
                address++;
            }
        }
    }

    @Override
    // Read a byte from memory
    public int readByte(int address) {
        //     System.out.println("read " + Utilities.getByte(memory[address]) + " @ " + Utilities.getWord(address));
        return memory[address];
    }

    @Override
    // Read a word from memory
    public int readWord(int address) {
        return readByte(address) + readByte(address + 1) * 256;
    }

    @Override
    public void writeByte(int address, int data) {

        //     System.out.println("write " + Utilities.getByte(data) + " @ " + Utilities.getWord(address));
        memory[address] = data;
    }

    @Override
    public void writeWord(int address, int data) {
        writeByte(address, (data & 0x00FF));
        address = (address + 1) & 65535;
        data = (data >>> 8);
        writeByte(address, data);
    }

    public void displayMemorySubset(int start, int end) {
        // Validate start and end indexes
        if (start < 0 || end > memory.length || start >= end) {
            System.out.println("Invalid range!");
            return;
        }
        // Iterate over the specified range of memory and print in chunks of 16 bytes
        for (int i = start; i < end; i += 16) {
            // Print the memory address in hexadecimal
            System.out.printf("%04X  ", i); // Print the address (8 hex digits)

            // Print up to 16 bytes in hexadecimal format
            for (int j = 0; j < 8 && i + j < end; j++) {
                System.out.printf("%02X ", memory[i + j]); // Print each byte as hex
            }

            // Fill in any remaining spaces if the last line has less than 16 bytes
            for (int j = end % 8; j < 8 && i + j < end; j++) {
                System.out.print(" ");
            }

            // Print the ASCII representation of the bytes
            System.out.print("  ");
            for (int j = 0; j < 8 && i + j < end; j++) {
                int b = memory[i + j];
                // Print the ASCII character or a dot if non-printable
                if (b >= 32 && b <= 126) {
                    System.out.print((char) b);
                } else {
                    System.out.print(".");
                }
            }
            System.out.println(); // Move to the next line after printing 16 bytes
        }
    }

    // Method to display all registers in hexadecimal format
    public void displayRegisters(Z80Core z80) {

        System.out.println("Z80 Registers:");

        // 8-bit registers
        System.out.printf("A   : %02X    F   : %02X    \n", z80.getRegisterValue(CPUConstants.RegisterNames.A), z80.getRegisterValue(CPUConstants.RegisterNames.F));
        System.out.printf("I   : %02X    R   : %02X    \n", z80.getRegisterValue(CPUConstants.RegisterNames.I), z80.getRegisterValue(CPUConstants.RegisterNames.R));

        // 16-bit register pairs
        System.out.printf("BC  : %04X    DE  : %04X    HL  : %04X\n",
                z80.getRegisterValue(CPUConstants.RegisterNames.BC) & 0xFFFF,
                z80.getRegisterValue(CPUConstants.RegisterNames.DE) & 0xFFFF,
                z80.getRegisterValue(CPUConstants.RegisterNames.HL));
        System.out.printf("A'   : %02X    F'   : %02X    \n",
                z80.getRegisterValue(CPUConstants.RegisterNames.A_ALT),
                z80.getRegisterValue(CPUConstants.RegisterNames.F_ALT));
        System.out.printf("BC'  : %04X    DE'  : %04X    HL'  : %04X\n",
                z80.getRegisterValue(CPUConstants.RegisterNames.BC_ALT) & 0xFFFF,
                z80.getRegisterValue(CPUConstants.RegisterNames.DE_ALT) & 0xFFFF,
                z80.getRegisterValue(CPUConstants.RegisterNames.HL_ALT));

        // Special registers
        System.out.printf("SP  : %04X    PC  : %04X    IX  : %04X    IY  : %04X\n",
                z80.getRegisterValue(CPUConstants.RegisterNames.SP) & 0xFFFF,
                z80.getRegisterValue(CPUConstants.RegisterNames.PC) & 0xFFFF,
                z80.getRegisterValue(CPUConstants.RegisterNames.IX) & 0xFFFF,
                z80.getRegisterValue(CPUConstants.RegisterNames.IY) & 0xFFFF);

        // Optional: Display the flags (F register as 8-bit flags)
        displayFlags();
    }

    // Display the status of flags (F register)
    private void displayFlags() {
        System.out.println("Flags (F Register):");
        //System.out.printf("Sign  : %d    Zero  : %d    Parity  : %d    Carry  : %d\n", (F & 0x80) >> 7, (F & 0x40) >> 6, (F & 0x04) >> 2, (F & 0x01));
    }

}
