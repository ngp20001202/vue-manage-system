import {
    reactive
} from "vue"
export default function () {
    let utcOffset = reactive([{
            label: "(UTC-12:00)",
            value: -12
        },
        {
            label: "(UTC-11:00)",
            value: -11
        },
        {
            label: "(UTC-10:00)",
            value: -10
        },
        {
            label: "(UTC-09:00)",
            value: -9
        },
        {
            label: "(UTC-08:00)",
            value: -8
        },
        {
            label: "(UTC-07:00)",
            value: -7
        },
        {
            label: "(UTC-06:00)",
            value: -6
        },
        {
            label: "(UTC-05:00)",
            value: -5
        },
        {
            label: "(UTC-04:00)",
            value: -4
        },
        {
            label: "(UTC-03:00)",
            value: -3
        },
        {
            label: "(UTC-02:00)",
            value: -2
        },
        {
            label: "(UTC-01:00)",
            value: -1
        },
        {
            label: "(UTC+00:00)",
            value: 0
        },
        {
            label: "(UTC+01:00)",
            value: 1
        },
        {
            label: "(UTC+02:00)",
            value: 2
        },
        {
            label: "(UTC+03:00)",
            value: 3
        },
        {
            label: "(UTC+04:00)",
            value: 4
        },
        {
            label: "(UTC+05:00)",
            value: 5
        },
        {
            label: "(UTC+06:00)",
            value: 6
        },
        {
            label: "(UTC+07:00)",
            value: 7
        },
        {
            label: "(UTC+08:00)",
            value: 8
        },
        {
            label: "(UTC+09:00)",
            value: 9
        },
        {
            label: "(UTC+10:00)",
            value: 10
        },
        {
            label: "(UTC+11:00)",
            value: 11
        },
        {
            label: "(UTC+12:00)",
            value: 12
        },
        {
            label: "(UTC+13:00)",
            value: 13
        },
        {
            label: "(UTC+14:00)",
            value: 14
        },
    ]);
    return {
        utcOffset
    }
}