"use client"
import { AutoComplete, Flex, Input } from "antd"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PROJECT_ROUTES } from "../layout/route"    

// Flatten routes recursively to include all nested routes
export const flattenRoutes = (routes, parentTitle = "") => {
    let flattened = []

    routes.forEach((route) => {
        const fullTitle = parentTitle ? `${parentTitle} > ${route.title}` : route.title
        flattened.push({ ...route, fullTitle, searchText: `${fullTitle} ${route.path}`.toLowerCase(),})
        if (route.children && route.children.length > 0) {
            flattened = flattened.concat(flattenRoutes(route.children, fullTitle))
        }
    })

    return flattened
}

const SearchBar = ({ placeholder = "Search routes...", style = {} }) => {
    const [searchValue, setSearchValue] = useState("")
    const [options, setOptions] = useState([])
    const navigate = useNavigate()
    const allRoutes = useMemo(() => flattenRoutes(PROJECT_ROUTES), [])

    // Filter routes based on search input
    const filterRoutes = (searchText) => {
        if (!searchText) return []
        const filtered = allRoutes.filter((route) => route.searchText.includes(searchText.toLowerCase()))
        return filtered.slice(0, 8)
    }

    // Handle search input change
    const handleSearch = (value) => {
        setSearchValue(value)

        if (value) {
            const filteredRoutes = filterRoutes(value)
            const suggestions = filteredRoutes.map((route) => ({
                value: route.path,
                label: (
                    <Flex justify="space-between" align="center"style={{ padding: "4px 0"}}>
                        <div>
                            <div style={{ fontWeight: 500 }}>{route.title}</div>
                            {route.fullTitle !== route.title && (<div style={{fontSize: "12px", color: "#666", marginTop: "2px",}}>{route.fullTitle}</div>)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#999", fontFamily: "monospace"}}>{route.path}</div>
                    </Flex>
                ),
                route: route,
            }))
            setOptions(suggestions)
        } else {
            setOptions([])
        }
    }

    const handleSelect = (value, option) => {
        setSearchValue("")
        setOptions([])
        navigate(value)
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && options.length > 0) {
            const firstOption = options[0]
            handleSelect(firstOption.value, firstOption)
        }
    }

    return (
        <AutoComplete
            value={searchValue}
            options={options}
            onSearch={handleSearch}
            onSelect={handleSelect}
            style={{ width: "100%", borderRadius:10, height:'40px', border:'1px solid rgba(221, 228, 255, 0.9)', height:'40px',  ...style}}
            placeholder={placeholder}
            allowClear
            notFoundContent={searchValue ? "No routes found" : null}
        >
            <Input
                onKeyDown={handleKeyPress}
                style={{
                    width:'450px',
                    borderRadius: 10,
                    padding:'4px 8px',
                    height: "40px",
                    border:'1px solid rgba(221,228,255,0.9)',
                    background:'rgba(255,255,255,0.9)',
                    boxShadow:'0 4px 10px rgba(148,163,184,0.18)'
                }}
            />
        </AutoComplete>
    )
}

export default SearchBar
