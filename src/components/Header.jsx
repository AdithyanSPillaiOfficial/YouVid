"use client";
import Image from 'next/image'
import React from 'react'
import logo from '@/assets/logo.png'
import { useRouter } from 'next/navigation'
import { Github } from 'lucide-react';

function Header() {
    const router = useRouter()
    const tabs = [
        {
            title : "Home",
            onclick : () => router.replace('/')
        },
        {
            title : "About",
            onClick : () => router.replace('/about')
        }
    ]
  return (
    <div className='w-full h-20 flex flex-row items-center shadow-2xl z-40 p-5'>
        <Image src={logo} width={200} alt='YouVid Logo'/>
        <div className='w-screen h-full flex flex-row items-center justify-center'>
            {tabs.map( (tab, index) => (
                <div className='h-10 w-20 flex flex-row items-center justify-center rounded-2xl hover:bg-red-500 transition delay-50 cursor-default' onClick={tab.onClick} key={index}>{tab.title}</div>
            ))}
        </div>
        <div className='ml-auto bg-black p-2 rounded-4xl'><a href="https://github.com/AdithyanSPillaiOfficial/YouVid" target='_blank'><Github color='white'/></a></div>
    </div>
  )
}

export default Header