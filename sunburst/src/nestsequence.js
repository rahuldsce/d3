export const sequence3 = [
    { label: 'Region', active: true, field: 'region' },
    { label: 'Cloudlet Status', active: true, field: 'cloudletStatus' },
    { label: 'Operator Name', active: false, field: 'operatorName' },
    { label: 'App Name', active: false, field: 'appname', path: [{ field: 'appinst' }], pi: 0 },
    // { label: 'App Name', active: false, field: 'clustername', path: 'appinst#AS#clusterinst' },
    { label: 'Cloudlet Name', active: false, field: 'cloudletName' },
]

const formatsequences2 = (org, sequences, index, inp, out, nested) => {
    let sindex = sequences[index]
    if (index > 0 && sequences[index - 1].path) {
        inp = org
    }
    if (sindex.path && !nested) {
        inp = inp[sindex.path[sindex.pi].field]
        if (inp) {
            for (let i = 0; i < inp.length; i++) {
                formatsequences2(org, sequences, index, inp[i], out, true)
            }
        }
    }
    else {
        let exist = false
        let currentout = undefined
        let nextOrderExist = index + 1 < sequences.length
        let field = sindex.field
        if (out && out.length > 0) {
            for (let i = 0; i < out.length; i++) {
                if (inp[field] === out[i].name) {
                    exist = true
                    currentout = out[i]
                    break;
                }
            }
        }
        if (!exist) {
            currentout = { name: inp[field] }
            if (nextOrderExist) {
                currentout.children = []
            }
            out.push(currentout)
        }
        if (nextOrderExist) {
            formatsequences2(org, sequences, index + 1, inp, currentout.children)
        }
    }
}
