import { LitElement, html, nothing } from 'lit';

const TRAFFIC_ACTION_URL = '/api/v1/web/mas-studio/fragment-traffic';

class MasFragmentTrafficPanel extends LitElement {
    static properties = {
        fragmentId: { type: String, attribute: 'fragment-id' },
        locale: { type: String },
        surface: { type: String },
        _loading: { type: Boolean, state: true },
        _data: { type: Object, state: true },
        _error: { type: Boolean, state: true },
    };

    createRenderRoot() {
        return this;
    }

    constructor() {
        super();
        this.fragmentId = null;
        this.locale = null;
        this.surface = null;
        this._loading = false;
        this._data = null;
        this._error = false;
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.#loadTraffic();
    }

    updated(changedProps) {
        if (changedProps.has('fragmentId') && this.fragmentId) {
            this.#loadTraffic();
        }
    }

    async #loadTraffic() {
        if (!this.fragmentId) return;
        this._loading = true;
        this._error = false;
        try {
            const response = await fetch(TRAFFIC_ACTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'getDisplays',
                    id: this.fragmentId,
                    locale: this.locale,
                    surface: this.surface,
                }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this._data = await response.json();
        } catch {
            this._error = true;
            this._data = null;
        } finally {
            this._loading = false;
        }
    }

    #trendColor(trend) {
        if (!trend) return 'var(--spectrum-gray-600)';
        const num = parseFloat(trend);
        if (isNaN(num) || num === 0) return 'var(--spectrum-gray-600)';
        return num > 0 ? 'var(--spectrum-green-700, #3b7d0e)' : 'var(--spectrum-red-700, #c9222c)';
    }

    #renderBucket(label, bucket) {
        if (!bucket) {
            return html`
                <tr>
                    <td style="padding: 4px 8px;">${label}</td>
                    <td style="padding: 4px 8px; color: var(--spectrum-gray-500);">—</td>
                </tr>
            `;
        }
        const { count, trend } = bucket;
        const trendText = trend ? html`<span style="color: ${this.#trendColor(trend)}; margin-left: 6px;">(${trend})</span>` : nothing;
        return html`
            <tr>
                <td style="padding: 4px 8px; color: var(--spectrum-gray-700);">${label}</td>
                <td style="padding: 4px 8px; font-variant-numeric: tabular-nums;">
                    ${count != null ? count.toLocaleString() : '—'}${trendText}
                </td>
            </tr>
        `;
    }

    render() {
        return html`
            <div class="fragment-traffic-panel" style="margin-top: 16px; padding: 12px; border: 1px solid var(--spectrum-gray-300); border-radius: 8px;">
                <div style="font-weight: 600; margin-bottom: 8px;">Fragment Traffic</div>
                ${this._loading
                    ? html`<sp-progress-circle indeterminate size="s"></sp-progress-circle>`
                    : this._error
                      ? html`<div style="font-size: 13px; color: var(--spectrum-gray-500);">Traffic data unavailable</div>`
                      : this.#renderTable()}
            </div>
        `;
    }

    #renderTable() {
        const d = this._data;
        return html`
            <table style="border-collapse: collapse; font-size: 13px; width: 100%;">
                <thead>
                    <tr>
                        <th style="padding: 4px 8px; text-align: left; color: var(--spectrum-gray-700); font-weight: 600;">Time</th>
                        <th style="padding: 4px 8px; text-align: left; color: var(--spectrum-gray-700); font-weight: 600;">Traffic</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.#renderBucket('last hour', d?.lastHour)}
                    ${this.#renderBucket('last day', d?.lastDay)}
                    ${this.#renderBucket('last month', d?.lastMonth)}
                </tbody>
            </table>
        `;
    }
}

customElements.define('mas-fragment-traffic-panel', MasFragmentTrafficPanel);
