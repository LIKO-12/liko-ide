import Tippy, { useSingleton } from '@tippyjs/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CodeEditor } from '../lib/code-editor';
import { ConnectionManager, ConnectionStatus } from '../lib/connection-manager';
import { connectionManager, remoteAgent } from '../singleton';

function LeftPanel() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const editor = new CodeEditor(containerRef.current, remoteAgent);
        return () => editor.dispose();
    }, [containerRef.current]);

    return <div className='left-panel' ref={containerRef}></div>;
}

function RightPanel() {
    return <div className='right-panel'>

    </div>;
}

interface StatusItemProps {
    /**
     * https://fonts.google.com/icons?icon.style=Outlined
     */
    icon?: string;
    alt?: string;
    content?: string;

    onClick?: () => void;

    /**
     * Tippy singleton.
     */
    singleton?: any;
}

function StatusItem({ icon, alt, content, onClick, singleton }: StatusItemProps) {
    return <Tippy content={alt} disabled={!alt} singleton={singleton}>
        <div onClick={onClick} className='item'>
            {icon ? <span className='material-icons-outlined'>{icon}</span> : null}
            {content ?? null}
        </div>
    </Tippy>
}

const statusLabels: Record<ConnectionStatus, string> = {
    [ConnectionStatus.NotConnected]: 'Not Connected',
    [ConnectionStatus.Connecting]: 'Connecting',
    [ConnectionStatus.Identifying]: 'Identifying',
    [ConnectionStatus.Connected]: 'Connected',
    [ConnectionStatus.Disconnected]: 'Disconnected',
};

const statusIcons: Record<ConnectionStatus, string> = {
    [ConnectionStatus.NotConnected]: 'power_off',
    [ConnectionStatus.Connecting]: 'pending',
    [ConnectionStatus.Identifying]: 'pending',
    [ConnectionStatus.Connected]: 'power',
    [ConnectionStatus.Disconnected]: 'power_off',
};


function ConnectionStatusItem({ singleton }: { singleton: any }) {
    const [status, setStatus] = useState(connectionManager.status);

    // TODO: Change color based on status.
    // TODO: Trigger reconnect/disconnect on user interaction.
    // TODO: Provide actual alt text.

    const onClick = useCallback(() => {
        if (connectionManager.status === ConnectionStatus.Disconnected) connectionManager.reconnect();
        else connectionManager.disconnect();
    }, []);

    useEffect(() => {
        const listener = (manager: ConnectionManager) => {
            setStatus(manager.status);
        };

        connectionManager.addEventListener('status_update', listener);
        return () => connectionManager.removeEventListener('status_update', listener);
    }, []);

    // TODO: Show the connected client version.

    return <StatusItem
        icon={statusIcons[status]}
        // alt='LIKO-12: experimental-20230217-1843'
        alt={status === ConnectionStatus.Disconnected ? 'Click to reconnect' : 'Click to disconnect'}
        content={statusLabels[status]}
        onClick={onClick}
        singleton={singleton}
    />;
}

function formatVersionName(version: string): string {
    const experimental = version.match(/^experimental\-(?<year>\d{4})(?<month>\d\d)(?<day>\d\d)\-(?<hour>\d\d)(?<minute>\d\d)$/);

    if (experimental?.groups) {
        const { year, month, day, hour, minute } = experimental.groups;
        return `EXPERIMENTAL ${year}-${month}-${day} ${hour}:${minute}`;
    }

    if (version.match(/^[0-9a-fA-F]{40}$/))
        return `DEVELOPMENT (${version.substring(0, 7)})`

    return version.toUpperCase();
}

function StatusBar() {
    const [source, target] = useSingleton();
    const version = useMemo(() => formatVersionName(LIKO_VERSION), [LIKO_VERSION]);
    const copyToClipboard = useCallback(() => navigator.clipboard.writeText(LIKO_VERSION), [LIKO_VERSION]);

    // TODO: Provide the singleton in a context.

    return <footer className='status-bar'>
        <Tippy singleton={source} duration={100} />

        <div className='left-items'>
            <StatusItem icon='sell' alt='IDE Version (click to copy)' content={version} onClick={copyToClipboard} singleton={target} />
        </div>
        <div className='right-items'>
            <ConnectionStatusItem singleton={target} />
            <StatusItem icon='play_arrow' alt='Execute the code in LIKO-12' content='Run Game' singleton={target} />
        </div>
    </footer>;
}

export function CodeEditorApp() {
    return <>
        <div className='panels-container'>
            <LeftPanel />
            <RightPanel />
        </div>
        <StatusBar />
    </>;
}