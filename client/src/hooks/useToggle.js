import { useState, useCallback, useMemo } from 'react'

const useToggle = () => {
    const [flag, setFlag] = useState(true)

    const toggleFlag = useCallback(() => {
        setFlag((prevStatus) => !prevStatus)
    }, [])

    const values = useMemo(
        () => ({
            flag,
            toggleFlag,
        }),
        [flag, toggleFlag],
    )

    return values
}

export default useToggle
