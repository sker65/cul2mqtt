/**
 * `--serialport tcp://host:port`: a CUL on a serial-to-network converter (Lantronix XPort,
 * ser2net, ...) or a CUNO, the same raw TCP connection as --host / --port.
 */

/** `tcp://host:port` → {host, port}; null for a serial device path; throws on a bad tcp address. */
export function parseTcpAddress(address) {
    if (!/^tcp:\/\//i.test(String(address))) {
        return null;
    }
    let url;
    try {
        url = new URL(address);
    } catch {
        throw new Error(`invalid address ${address}, expected tcp://host:port`);
    }
    const port = Number(url.port);
    if (!url.hostname || !Number.isInteger(port) || port < 1 || port > 65535 || url.pathname.length > 1) {
        throw new Error(`invalid address ${address}, expected tcp://host:port`);
    }
    return {host: url.hostname.replace(/^\[(.*)\]$/, '$1'), port};
}
