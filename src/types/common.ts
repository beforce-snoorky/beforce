export type ActionFailure = { ok: false; error: string }

export type ActionResult<T extends object> = ({ ok: true } & T) | ActionFailure
