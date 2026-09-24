import { CODEKIN_DOWNLOADS, CODEKIN_UPDATE_HELP, CODEKIN_PACKAGE, codekinVersionUrl } from '../../../../src/update-contract.ts'
import { PanelDialog } from './PanelDialog.tsx'
import type { CodekinUpdates } from './use-codekin-updates.ts'
import css, { styleText } from './codekin-updates.module.css'

export function CodekinUpdateInfo({ updates, zh, problem = false }: { updates: CodekinUpdates; zh: boolean; problem?: boolean }) {
  const { report: r, busy, unavailable } = updates
  const candidate = r?.latestCompatibleVersion ?? null
  const offerInstall = candidate !== null && (r?.updateAvailable || r?.compatible === false)
  const text = zh ? {
    title: '版本与更新', installed: '当前码灵', host: '正在运行的 DSH', web: 'dsh-web', unknown: '未识别',
    compatible: '当前版本兼容', incompatible: '当前版本不兼容', needs: '发现适配更新', current: '当前版本无需更新',
    checking: '正在查询适配版本…', failed: '暂时无法检查更新。请稍后重试，或前往版本列表查看。',
    noHost: '无法识别正在运行的 DSH 版本，暂不推荐特定版本。请先在 DSH 中确认版本号。',
    none: '暂未找到适配当前 DSH 的已发布版本，请留意后续发布。',
    candidate: '最新兼容发布', check: '检查更新', download: '查看适配版本', versions: '全部版本', help: 'GitHub 发布说明',
    manual: '仅提示更新，不会自动下载或安装。检查只查询公开版本信息，不会上传存档或对话。',
    install: '在 DSH 插件管理中选择此版本安装，完成后重新打开码灵：',
    problem: '码灵暂时无法启动。请核对以下版本信息；若是版本不兼容，可从这里获取适配包。',
  } : {
    title: 'Versions & updates', installed: 'Installed Codekin', host: 'Running DSH', web: 'dsh-web', unknown: 'Unknown',
    compatible: 'Installed version is compatible', incompatible: 'Installed version is incompatible', needs: 'Compatible update available', current: 'No update needed',
    checking: 'Checking compatible releases…', failed: 'Unable to check updates. Retry later or browse the release list.',
    noHost: 'The running DSH version could not be identified. Check it in DSH before choosing a release.',
    none: 'No published release matches this DSH yet. Check back for a compatible release.',
    candidate: 'Latest compatible release', check: 'Check for updates', download: 'View compatible release', versions: 'All versions', help: 'GitHub release notes',
    manual: 'Notifications only; nothing is downloaded or installed automatically. Checks use public release metadata, never your save or conversations.',
    install: 'Select this version in the DSH plugin manager, then reopen Codekin:',
    problem: 'Codekin could not start. Check the versions below; use a compatible package if a version mismatch is responsible.',
  }
  const message = unavailable || r?.status === 'unavailable' ? text.failed
    : r?.status === 'host-unknown' ? text.noHost
      : !r || r.status === 'checking' || r.status === 'idle' ? text.checking
        : !candidate ? text.none : r.updateAvailable ? text.needs : r.compatible === false ? text.incompatible : text.current
  return <div className={css.content}>
    <style data-plugin-css="codekin-updates">{styleText}</style>
    {problem && <p className={css.problem} role="alert">{text.problem}</p>}
    <dl className={css.versions}>
      <div><dt>{text.installed}</dt><dd>{r?.installedVersion ?? '—'}</dd></div>
      <div><dt>{text.host}</dt><dd>{r?.dshVersion ?? text.unknown}</dd></div>
      {r?.dshWebVersion && <div><dt>{text.web}</dt><dd>{r.dshWebVersion}</dd></div>}
    </dl>
    {r?.compatible !== null && r?.compatible !== undefined && <strong className={r.compatible ? css.compatible : css.problem}>{r.compatible ? text.compatible : text.incompatible}</strong>}
    <div className={css.status} role="status"><strong>{message}</strong>
      {candidate && <p>{text.candidate} · <b>{candidate}</b></p>}
    </div>
    {offerInstall && <div className={css.install}><p>{text.install}</p><code>{CODEKIN_PACKAGE}@{candidate}</code></div>}
    <div className={css.actions}>
      <button type="button" disabled={busy} onClick={() => { void updates.refresh(true) }}>{busy ? text.checking : text.check}</button>
      <a href={codekinVersionUrl(candidate)} target="_blank" rel="noopener noreferrer">{candidate ? text.download : text.versions} ↗</a>
      <a href={CODEKIN_UPDATE_HELP} target="_blank" rel="noopener noreferrer">{text.help} ↗</a>
      {candidate && <a href={CODEKIN_DOWNLOADS} target="_blank" rel="noopener noreferrer">{text.versions} ↗</a>}
    </div>
    <small className={css.note}>{text.manual}</small>
  </div>
}

export function CodekinUpdateDialog(props: { updates: CodekinUpdates; zh: boolean; problem?: boolean; close: () => void }) {
  return <PanelDialog id="codekin-updates" title={props.zh ? '版本与更新' : 'Versions & updates'} closeLabel={props.zh ? '关闭更新提示' : 'Close update notice'} onClose={props.close}>
    <CodekinUpdateInfo {...props} />
  </PanelDialog>
}
