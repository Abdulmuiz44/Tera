"use client"

import MermaidRenderer from '@/components/visuals/MermaidRenderer'

export default function TestMermaidPage() {
    return (
        <div className="p-8 bg-black min-h-screen text-white">
            <h1 className="text-2xl mb-8">Mermaid Renderer Test</h1>

            <div className="mb-8">
                <h2 className="text-xl mb-4">1. Simple Flowchart</h2>
                <MermaidRenderer chart={`graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]`} />
            </div>

            <div className="mb-8">
                <h2 className="text-xl mb-4">2. Water Cycle (like AI would generate)</h2>
                <MermaidRenderer chart={`graph TD
    A[Evaporation] --> B[Condensation]
    B --> C[Precipitation]
    C --> D[Collection]
    D --> A`} />
            </div>

            <div className="mb-8">
                <h2 className="text-xl mb-4">3. Sequence Diagram</h2>
                <MermaidRenderer chart={`sequenceDiagram
    participant User
    participant Server
    User->>Server: Login Request
    Server-->>User: Auth Token`} />
            </div>

            <div className="mb-8">
                <h2 className="text-xl mb-4">4. Invalid Syntax (should show clean error, NOT raw mermaid error text)</h2>
                <MermaidRenderer chart={`graph TD
    A-->
    INVALID SYNTAX HERE`} />
            </div>
        </div>
    )
}
