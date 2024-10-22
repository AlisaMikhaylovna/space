'use client'

import { Prisma, Subreddit } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import debounce from "lodash.debounce"
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { useOnClickOutside } from '@/hooks/use-on-click-outside'
import { Users } from 'lucide-react'


export const SearchBar = () => {
    const [input, setInput] = useState<string>('')
    const pathname = usePathname()
    const commandRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const serverId = pathname?.split("/")[1];

    useOnClickOutside(commandRef, () => {
        setInput('')
    })

    const request = debounce(async () => {
        refetch()
    }, 300)

    const debounceRequest = useCallback(() => {
        request()
    }, [])

    const {
        data: queryResults,
        refetch,
        isFetched,
    } = useQuery({
        queryFn: async () => {
            if (!input) return []
            const { data } = await axios.get(`/api/search?query=${input}`)
            return data as (Subreddit & {
                _count: Prisma.SubredditCountOutputType
            })[]
        },
        queryKey: ['search-query'],
        enabled: false,
    })

    useEffect(() => {
        setInput('')
    }, [pathname])

    return (
        <Command
            ref={commandRef}
            className='relative rounded-lg border max-w-lg z-50 overflow-visible'>
            <CommandInput
                onValueChange={(text) => {
                    setInput(text)
                    debounceRequest()
                }}
                value={input}
                className='outline-none border-none focus:border-none focus:outline-none ring-0'
                placeholder='Search topics...'
            />

            {input.length > 0 && (
                <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'>
                    {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
                    {(queryResults?.length ?? 0) > 0 ? (
                        <CommandGroup heading='topics'>
                            {queryResults?.map((subreddit) => (
                                <CommandItem
                                    onSelect={(e) => {
                                        router.push(`/servers/${serverId}/topics/${e}`)
                                        router.refresh()
                                    }}
                                    key={subreddit.id}
                                    value={subreddit.name}>
                                    <Users className='mr-2 h-4 w-4' />
                                    <a href={`servers/${serverId}/topics/${subreddit.name}`}>{subreddit.name}</a>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : null}
                </CommandList>
            )}
        </Command>
    )
}

