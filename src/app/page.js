import Form from "@/components/Form";
import Header from "@/components/Header";
import Image from "next/image";
import React from 'react'


export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-x-hidden">
      <Header />
      <div className="flex-1 w-full h-full flex flex-col justify-center items-center mt-20">
        <Form />
      </div>
    </div>
  )
}
