import { MetricCard } from '../components/MetricCard.jsx'

export function Finance({ profitReport, summary }) {
  const totalProfit = profitReport.reduce((sum, item) => sum + item.gross_profit, 0)
  const totalRevenue = profitReport.reduce((sum, item) => sum + item.sale_price, 0)
  const totalCost = profitReport.reduce((sum, item) => sum + item.cost, 0)
  const totalIngredientCost = profitReport.reduce((sum, item) => sum + item.ingredient_cost, 0)
  const totalPackagingCost = profitReport.reduce((sum, item) => sum + item.packaging_cost, 0)

  return (
    <div className="page-grid">
      <section className="metrics">
        <MetricCard label="规格销售额" value={`¥${totalRevenue.toFixed(1)}`} helper="按当前规格售价汇总" />
        <MetricCard label="原料成本" value={`¥${totalIngredientCost.toFixed(1)}`} helper="食材原料总成本" />
        <MetricCard label="包装损耗" value={`¥${totalPackagingCost.toFixed(1)}`} helper="包装与损耗成本" />
        <MetricCard label="毛利合计" value={`¥${totalProfit.toFixed(1)}`} helper="售价减当前标准成本" />
        <MetricCard label="平均毛利率" value={`${Math.round((summary?.average_margin ?? 0) * 100)}%`} helper="全规格平均" />
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>成本利润核算</h2>
          <span>{profitReport.length} 条</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>菜品</th>
                <th>规格</th>
                <th>售价</th>
                <th>原料成本</th>
                <th>包装损耗</th>
                <th>总成本</th>
                <th>毛利</th>
                <th>毛利率</th>
              </tr>
            </thead>
            <tbody>
              {profitReport.map((line) => (
                <tr key={`${line.dish_id}-${line.spec_name}`}>
                  <td><strong>{line.dish_name}</strong></td>
                  <td>{line.spec_name}</td>
                  <td>¥{line.sale_price}</td>
                  <td>¥{line.ingredient_cost}</td>
                  <td>¥{line.packaging_cost}</td>
                  <td>¥{line.cost}</td>
                  <td>¥{line.gross_profit}</td>
                  <td>
                    <div className="margin-cell">
                      <span style={{ width: `${line.sale_price > 0 ? Math.round(line.gross_margin * 100) : 0}%` }} />
                      <b>{line.sale_price > 0 ? Math.round(line.gross_margin * 100) : 0}%</b>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

