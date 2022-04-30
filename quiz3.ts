import wabt from 'wabt';

async function run(watSource : string, config: any) : Promise<number> {
    const wabtApi = await wabt();

    const parsed = wabtApi.parseWat("example", watSource);
    const binary = parsed.toBinary({});
    const wasmModule = await WebAssembly.instantiate(binary.buffer, config);
    return (wasmModule.instance.exports as any)._start();
}



const importObject = {
    imports: {
        print_hex: (arg: any) => {
            var big = arg.toString(16);
            big = '0'.repeat(8 - big.length) + big;
            var little = '';
            for(var i=0; i < 4; i ++) {
                little = big.substring(i*2, i*2+2) + little;
            }
            importObject.output += little;
            console.log(little);
        }
    },
    output: ""
};

run(`(module
    (func $print_hex (import "imports" "print_hex") (param i32))
    (memory 100)
    (func (export "_start") (result i32)
    (i32.const 0)
    (i32.const 0x05000000)
    (i32.store)
    (i32.const 4)
    (i32.const 0x01000000)
    (i32.store)
    (i32.const 8)
    (i32.const 0x10000000)
    (i32.store)
    (i32.const 1)
    (i32.load)
    (call $print_hex)
    (i32.const 4)
    (i32.load)
    (call $print_hex)
    (i32.const 0)
    )
    )`, importObject).then((v) => console.log(v))