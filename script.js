var numbers_data = []
var bars_timeout = []
var swap_speed = 10


const randint = (lower, upper) => {
    return Math.floor(Math.random() * (upper - lower)) + lower
}


const rem = (rem) => {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
}


const btn_toggle = () => {
    document.querySelectorAll('.btn').forEach(e => {
        if (e.id === 'sort') {
            if (e.value === 'Urutkan!') e.value = 'Stop'
            else e.value = 'Urutkan!'
        }
        else {
            e.disabled = !e.disabled
        }
    })
}


const render = (numbers, highlights = []) => {
    numbers_data = numbers
    const template = '<div class="bar color-COLOR height-HEIGHT HIGHLIGHT HIDETEXT">DATA</div>'
    let hide_text = (numbers.length >= 100 ? 'hide-text' : '')

    let numbers_sorted = [...numbers].sort((a, b) => {return a - b})
    let max_number = Math.max(...numbers)

    let barHTML = ''
    let i = 0
    numbers.forEach(e => {
        let highlight = (highlights.includes(i) ? 'highlight' : '')
        let color = (numbers.length == 1 ? 50 : Math.floor(numbers_sorted.indexOf(e)*(99/(numbers_sorted.length - 1))) + 1)
        let height = Math.floor(e*95/max_number) + 5
        barHTML += template
                        .replace('COLOR',color)
                        .replace('HEIGHT', height)
                        .replace('DATA', e)
                        .replace('HIGHLIGHT',highlight)
                        .replace('HIDETEXT', hide_text)
        i++
    })
    document.getElementById('bar-content').innerHTML = barHTML
}


document.getElementById('number-render').onclick = () => {
    let data = document.getElementById('number-data')
    let raw_data = (data.value === '' ? data.placeholder : data.value)
    let arr = raw_data.split(' ')
    let numbers = arr
                    .map(e => {return parseInt(e)})
                    .filter(e => {return !isNaN(e)})
    render(numbers)
}


document.getElementById('random-render').onclick = () => {
    let size = parseInt(document.getElementById('data-size').value)
    if (isNaN(size)) {
        let upper_bound = Math.floor(window.innerWidth/rem(2))
        size = randint(upper_bound - 10, upper_bound + 10)
    }
    let arr = [...Array(size)].map(() => randint(1, 101))
    render(arr)
}


document.getElementById('sort').onclick = () => {
    const bubble_sort = (arr) => {
        let states = []

        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - 1 - i; j++) {
                states.push([j, j + 1, false])
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
                    states.push([j, j + 1, true])
                }
            }
        }

        return states
    }


    const selection_sort = (arr) => {
        let states = []

        for (let i = 0; i < arr.length - 1; i++) {
            let min_value = Infinity
            let min_idx = 0
            for (let j = i; j < arr.length; j++) {
                if (arr[j] < min_value) {
                    min_value = arr[j]
                    min_idx = j
                }
                states.push([min_idx, j, false])
                if (j === arr.length - 1) {
                    [arr[i], arr[min_idx]] = [arr[min_idx], arr[i]]
                    states.push([min_idx, i, true])
                }
            }
        }

        return states
    }


    const insertion_sort = (arr) => {
        let states = []

        for (let i = 1; i < arr.length; i++) {
            for (let j = i; j > 0; j--) {
                states.push([j, j - 1, false])
                if (arr[j] < arr[j - 1]) {
                    [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]]
                    states.push([j, j - 1, true])
                }
                else {
                    break
                }
            }
        }
        return states
    }


    const quick_sort = (arr) => {
        let states = []

        const partition = (arr, low, high) => {
            let pivot = arr[high]
            let i = low - 1

            for (let j = low; j < high; j++) {
                states.push([i, j, false])
                if (arr[j] < pivot) {
                    i++
                    [arr[i], arr[j]] = [arr[j], arr[i]]
                    states.push([i, j, false])
                    states.push([i, j, true])
                }
            }
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
            states.push([i + 1, high, true])
            return i + 1
        }

        const sort = (arr, low, high) => {
            if (low < high) {
                let pi = partition(arr, low, high)
                sort(arr, low, pi - 1)
                sort(arr, pi + 1, high)
            }
        }

        sort(arr, 0, arr.length - 1)
        return states
    }


    const merge_sort = (arr) => {
        let states = []

        const merge = (arr, low, mid, high) => {
            let arr1 = arr.slice(low, mid + 1)
            let arr2 = arr.slice(mid + 1, high + 1)

            let p1 = 0, p2 = 0, i = low;
            while (p1 < arr1.length && p2 < arr2.length) {
                if (arr1[p1] < arr2[p2]) {
                    arr[i++] = arr1[p1++]
                }
                else {
                    arr[i++] = arr2[p2++]
                }
            }
            while (p1 < arr1.length) {
                arr[i++] = arr1[p1++]
            }
            while (p2 < arr2.length) {
                arr[i++] = arr2[p2++]
            }

            let arr_temp = [...arr1, ...arr2]
            
            for (let i = 0; i < arr_temp.length; i++) {
                let idx = arr_temp.lastIndexOf(arr[i + low])
                let temp = arr_temp[i]
                arr_temp[i] = arr_temp[idx]
                arr_temp[idx] = temp
                states.push([i + low, idx + low, true])
            }
        }

        const sort = (arr, low, high) => {
            if (low < high) {
                let mid = Math.floor(low + (high - low)/2)
                sort(arr, low, mid)
                sort(arr, mid + 1, high)
                merge(arr, low, mid, high)
            }
        }

        sort(arr, 0, arr.length - 1)
        
        return states
    }


    const render_animation = (states, arr) => {
        states.push([])
        let counter = 0
        states.forEach(e => {
            bars_timeout.push(
                setTimeout(() => {
                    if (e[2] === true) {
                        [arr[e[0]], arr[e[1]]] = [arr[e[1]], arr[e[0]]]
                    }
                    render(arr, e)
                    if (e.length === 0) {
                        setTimeout(() => {
                            render(arr, e)
                            btn_toggle()
                        }, 10)
                    }
                }, counter * swap_speed)
            )
            counter++
        })
    }


    let button = document.getElementById('sort')
    if (button.value === 'Urutkan!') {
        let algorithm = document.getElementById('sort-algorithm').value
        swap_speed = parseInt(document.getElementById('sort-speed').value)
    
        if (numbers_data.length > 1) {
            btn_toggle()
            bars_timeout = []
            let states = eval(algorithm + '([...numbers_data])')
            render_animation(states, numbers_data)
        }
    }
    else {
        if (bars_timeout.length > 0) {
            bars_timeout.forEach(e => {
                clearTimeout(e)
            })
            btn_toggle()
            bars_timeout = []
        }
    }
}


const main = () => {
    const size_listener = () => {
        const limit = 1200

        const adjust_vh = () => {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`)
        }
        const update_btn = () => {
            if (window.innerWidth < limit) {
                document.getElementById('random-render').value = 'Acak'
            }
            else {
                document.getElementById('random-render').value = 'Masukkan Data Acak'
            }
        }

        adjust_vh()
        update_btn()
    }

    size_listener()
    window.addEventListener('resize', () => {
        size_listener()
    })

    document.getElementById('random-render').click()
}
main()