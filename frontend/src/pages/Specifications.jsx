import { useState } from 'react'
import { AlertCircle, CheckCircle, Plus, Save, Trash2 } from 'lucide-react'
import { api } from '../api/client.js'
import { EmptyState } from '../components/EmptyState.jsx'

const initialForm = {
  dish_id: '',
  name: '标准份',
  serving_size: '',
  sale_price: '',
  ingredient_cost: '',
  packaging_cost: '',
}

export function Specifications({ dishes, specifications, refresh }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(null)

  const clearMessages = () => {
    setError(null)
    setFieldErrors({})
    setSuccess(null)
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    if (error || success) clearMessages()
  }

  const submit = async (event) => {
    event.preventDefault()
    clearMessages()
    try {
      await api.createSpecification({
        ...form,
        sale_price: Number(form.sale_price),
        ingredient_cost: Number(form.ingredient_cost),
        packaging_cost: Number(form.packaging_cost),
      })
      setForm(initialForm)
      setSuccess('规格已保存成功')
      setTimeout(() => setSuccess(null), 3000)
      refresh()
    } catch (err) {
      setError(err.message || '保存失败，请检查输入')
      if (err.fieldErrors) {
        const map = {}
        for (const item of err.fieldErrors) {
          map[item.field] = item.message
        }
        setFieldErrors(map)
      }
    }
  }

  const remove = async (spec) => {
    clearMessages()
    try {
      await api.deleteSpecification(spec.id)
      setSuccess(`规格「${spec.name}」已删除`)
      setTimeout(() => setSuccess(null), 2500)
      refresh()
    } catch (err) {
      setError(`删除「${spec.name}」失败：${err.message || '请稍后重试'}`)
    }
  }

  const dishName = (id) => dishes.find((dish) => dish.id === id)?.name || '未知菜品'

  const fieldErrorFor = (field) => fieldErrors[field]

  return (
    <div className="two-column">
      <section className="panel">
        <div className="section-title">
          <h2>规格与价格</h2>
          <span>{specifications.length} 个规格</span>
        </div>
        {specifications.length === 0 ? (
          <EmptyState text="还没有规格" />
        ) : (
          <div className="card-grid">
            {specifications.map((spec) => (
              <article className="spec-card" key={spec.id}>
                <div>
                  <span>{dishName(spec.dish_id)}</span>
                  <h3>{spec.name}</h3>
                </div>
                <dl>
                  <div><dt>出品量</dt><dd>{spec.serving_size}</dd></div>
                  <div><dt>售价</dt><dd>¥{spec.sale_price}</dd></div>
                  <div className="cost-breakdown">
                    <dt>原料成本</dt>
                    <dd>¥{spec.ingredient_cost.toFixed(1)}</dd>
                  </div>
                  <div className="cost-breakdown">
                    <dt>包装损耗</dt>
                    <dd>¥{spec.packaging_cost.toFixed(1)}</dd>
                  </div>
                  <div className="cost-total">
                    <dt>总成本</dt>
                    <dd>¥{(spec.ingredient_cost + spec.packaging_cost).toFixed(1)}</dd>
                  </div>
                  <div className="profit-row">
                    <dt>毛利</dt>
                    <dd>¥{spec.gross_profit.toFixed(1)}</dd>
                  </div>
                  <div>
                    <dt>毛利率</dt>
                    <dd>{spec.sale_price > 0 ? Math.round(spec.gross_margin * 100) : 0}%</dd>
                  </div>
                </dl>
                <button className="danger icon-only" onClick={() => remove(spec)} type="button" title="删除规格">
                  <Trash2 size={15} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel side-panel">
        <div className="section-title">
          <h2>新增规格</h2>
          <Plus size={18} />
        </div>
        <form className="form" onSubmit={submit}>
          {success && (
            <div className="notice success">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="notice error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <label>
            关联菜品
            <select
              value={form.dish_id}
              onChange={(event) => updateField('dish_id', event.target.value)}
              className={fieldErrorFor('dish_id') ? 'input-error' : ''}
              required
            >
              <option value="">选择菜品</option>
              {dishes.map((dish) => (
                <option key={dish.id} value={dish.id}>{dish.name}</option>
              ))}
            </select>
            {fieldErrorFor('dish_id') && <small className="field-error">{fieldErrorFor('dish_id')}</small>}
          </label>
          <label>
            规格名称
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className={fieldErrorFor('name') ? 'input-error' : ''}
              required
            />
            {fieldErrorFor('name') && <small className="field-error">{fieldErrorFor('name')}</small>}
          </label>
          <label>
            出品量
            <input
              value={form.serving_size}
              onChange={(event) => updateField('serving_size', event.target.value)}
              placeholder="例如 250g"
              className={fieldErrorFor('serving_size') ? 'input-error' : ''}
              required
            />
            {fieldErrorFor('serving_size') && <small className="field-error">{fieldErrorFor('serving_size')}</small>}
          </label>
          <div className="form-grid">
            <label>
              售价
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.sale_price}
                onChange={(event) => updateField('sale_price', event.target.value)}
                className={fieldErrorFor('sale_price') ? 'input-error' : ''}
                required
              />
              {fieldErrorFor('sale_price') && <small className="field-error">{fieldErrorFor('sale_price')}</small>}
            </label>
            <label>
              原料成本
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.ingredient_cost}
                onChange={(event) => updateField('ingredient_cost', event.target.value)}
                className={fieldErrorFor('ingredient_cost') ? 'input-error' : ''}
                required
              />
              {fieldErrorFor('ingredient_cost') && <small className="field-error">{fieldErrorFor('ingredient_cost')}</small>}
            </label>
          </div>
          <label>
            包装/损耗成本
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.packaging_cost}
              onChange={(event) => updateField('packaging_cost', event.target.value)}
              className={fieldErrorFor('packaging_cost') ? 'input-error' : ''}
              required
            />
            {fieldErrorFor('packaging_cost') && <small className="field-error">{fieldErrorFor('packaging_cost')}</small>}
          </label>
          <button className="primary" type="submit">
            <Save size={16} />
            <span>保存规格</span>
          </button>
        </form>
      </section>
    </div>
  )
}

