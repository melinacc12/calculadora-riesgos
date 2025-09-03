"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Calculator,
  Shield,
  Grid3X3,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  TrendingUp,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Risk {
  id: string
  name: string
  probability: number
  impact: number
  severity: number
}

export default function RiskCalculator() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [formData, setFormData] = useState({
    name: "",
    probability: "",
    impact: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedRisks = localStorage.getItem("risk-calculator-data")
    if (savedRisks) {
      try {
        setRisks(JSON.parse(savedRisks))
      } catch (error) {
        console.error("Error loading saved risks:", error)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("risk-calculator-data", JSON.stringify(risks))
    }
  }, [risks, isLoading])

  const addRisk = () => {
    if (formData.name && formData.probability && formData.impact) {
      const probability = Number.parseInt(formData.probability)
      const impact = Number.parseInt(formData.impact)
      const severity = probability * impact

      const newRisk: Risk = {
        id: Date.now().toString(),
        name: formData.name,
        probability,
        impact,
        severity,
      }

      setRisks([...risks, newRisk])
      setFormData({ name: "", probability: "", impact: "" })
    }
  }

  const deleteRisk = (id: string) => {
    setRisks(risks.filter((risk) => risk.id !== id))
  }

  const clearAllRisks = () => {
    setRisks([])
  }

  const exportRisks = () => {
    const dataStr = JSON.stringify(risks, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `risk-assessment-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importRisks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedRisks = JSON.parse(e.target?.result as string)
          if (Array.isArray(importedRisks)) {
            setRisks(importedRisks)
          } else {
            alert("Formato de archivo inválido")
          }
        } catch (error) {
          alert("Error al importar el archivo")
        }
      }
      reader.readAsText(file)
    }
    // Reset the input
    event.target.value = ""
  }

  const getRiskLevel = (severity: number) => {
    if (severity <= 5) return { level: "Bajo", color: "bg-chart-1", textColor: "text-green-800" }
    if (severity <= 10) return { level: "Medio", color: "bg-chart-2", textColor: "text-yellow-800" }
    if (severity <= 15) return { level: "Alto", color: "bg-chart-3", textColor: "text-orange-800" }
    return { level: "Crítico", color: "bg-chart-4", textColor: "text-red-800" }
  }

  const getRisksForCell = (probability: number, impact: number) => {
    return risks.filter((risk) => risk.probability === probability && risk.impact === impact)
  }

  const getMatrixCellColor = (severity: number) => {
    const riskLevel = getRiskLevel(severity)
    return riskLevel.color
  }

  const getStatistics = () => {
    if (risks.length === 0) return null

    const riskCounts = {
      bajo: risks.filter((r) => r.severity <= 5).length,
      medio: risks.filter((r) => r.severity > 5 && r.severity <= 10).length,
      alto: risks.filter((r) => r.severity > 10 && r.severity <= 15).length,
      critico: risks.filter((r) => r.severity > 15).length,
    }

    const avgSeverity = risks.reduce((sum, risk) => sum + risk.severity, 0) / risks.length

    return { riskCounts, avgSeverity }
  }

  const stats = getStatistics()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Cargando calculadora de riesgos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calculadora de Gestión de Riesgos</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Evalúa y gestiona riesgos utilizando la fórmula: <strong>Gravedad = Probabilidad × Impacto</strong>
          </p>
        </div>

        {stats && (
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Resumen de Riesgos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{risks.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.riskCounts.bajo}</div>
                  <div className="text-xs text-muted-foreground">Bajo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.riskCounts.medio}</div>
                  <div className="text-xs text-muted-foreground">Medio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.riskCounts.alto}</div>
                  <div className="text-xs text-muted-foreground">Alto</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.riskCounts.critico}</div>
                  <div className="text-xs text-muted-foreground">Crítico</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-center">
                <span className="text-sm text-muted-foreground">Gravedad Promedio: </span>
                <span className="font-semibold text-primary">{stats.avgSeverity.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Gestión de Datos</CardTitle>
            <CardDescription>Exportar, importar o limpiar los datos de riesgos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={exportRisks}
                variant="outline"
                disabled={risks.length === 0}
                className="flex-1 sm:flex-none bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>

              <div className="flex-1 sm:flex-none">
                <input type="file" accept=".json" onChange={importRisks} className="hidden" id="import-file" />
                <Button asChild variant="outline" className="w-full sm:w-auto bg-transparent">
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </label>
                </Button>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={risks.length === 0} className="flex-1 sm:flex-none">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Limpiar Todo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará todos los riesgos registrados. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllRisks}>Eliminar Todo</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {/* Risk Input Form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Calculator className="h-5 w-5" />
                Registrar Nuevo Riesgo
              </CardTitle>
              <CardDescription>Ingresa los datos del riesgo para calcular automáticamente su gravedad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="risk-name">Nombre del Riesgo</Label>
                <Input
                  id="risk-name"
                  placeholder="Ej: Falla del servidor principal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="probability">Probabilidad (1-5)</Label>
                  <Select
                    value={formData.probability}
                    onValueChange={(value) => setFormData({ ...formData, probability: value })}
                  >
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muy Baja</SelectItem>
                      <SelectItem value="2">2 - Baja</SelectItem>
                      <SelectItem value="3">3 - Media</SelectItem>
                      <SelectItem value="4">4 - Alta</SelectItem>
                      <SelectItem value="5">5 - Muy Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impact">Impacto (1-5)</Label>
                  <Select
                    value={formData.impact}
                    onValueChange={(value) => setFormData({ ...formData, impact: value })}
                  >
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muy Bajo</SelectItem>
                      <SelectItem value="2">2 - Bajo</SelectItem>
                      <SelectItem value="3">3 - Medio</SelectItem>
                      <SelectItem value="4">4 - Alto</SelectItem>
                      <SelectItem value="5">5 - Muy Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.probability && formData.impact && (
                <div className="p-4 bg-gradient-to-r from-muted to-muted/50 rounded-lg border border-primary/20 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Gravedad Calculada:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {Number.parseInt(formData.probability) * Number.parseInt(formData.impact)}
                      </span>
                      <Badge
                        className={
                          getRiskLevel(Number.parseInt(formData.probability) * Number.parseInt(formData.impact)).color
                        }
                      >
                        {getRiskLevel(Number.parseInt(formData.probability) * Number.parseInt(formData.impact)).level}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={addRisk}
                className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={!formData.name || !formData.probability || !formData.impact}
              >
                Agregar Riesgo
              </Button>
            </CardContent>
          </Card>

          {/* Risk List */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <AlertTriangle className="h-5 w-5" />
                Riesgos Registrados ({risks.length})
              </CardTitle>
              <CardDescription>Lista de todos los riesgos evaluados con sus niveles de gravedad</CardDescription>
            </CardHeader>
            <CardContent>
              {risks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No hay riesgos registrados aún</p>
                  <p className="text-sm">Agrega tu primer riesgo usando el formulario</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {risks.map((risk) => {
                    const riskLevel = getRiskLevel(risk.severity)
                    return (
                      <div
                        key={risk.id}
                        className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-all duration-200 hover:border-primary/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-medium text-foreground leading-tight">{risk.name}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={riskLevel.color}>{riskLevel.level}</Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminar Riesgo</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que quieres eliminar el riesgo "{risk.name}"? Esta acción no se
                                    puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteRisk(risk.id)}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Probabilidad:</span> {risk.probability}
                          </div>
                          <div>
                            <span className="font-medium">Impacto:</span> {risk.impact}
                          </div>
                          <div>
                            <span className="font-medium">Gravedad:</span> {risk.severity}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Grid3X3 className="h-5 w-5" />
              Matriz de Riesgos Interactiva
            </CardTitle>
            <CardDescription>
              Visualización de la matriz 5x5 donde cada celda representa la combinación de probabilidad e impacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Legend */}
              <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-1"></div>
                  <span className="text-xs md:text-sm">Bajo (1-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-2"></div>
                  <span className="text-xs md:text-sm">Medio (6-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-3"></div>
                  <span className="text-xs md:text-sm">Alto (11-15)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-4"></div>
                  <span className="text-xs md:text-sm">Crítico (16-25)</span>
                </div>
              </div>

              {/* Matrix */}
              <div className="overflow-x-auto">
                <div className="min-w-[500px] md:min-w-[600px]">
                  {/* Matrix Header */}
                  <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                    <div></div>
                    <div className="text-center font-medium text-xs md:text-sm text-muted-foreground col-span-5">
                      Impacto
                    </div>
                    <div></div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
                    <div></div>
                    {[1, 2, 3, 4, 5].map((impact) => (
                      <div key={impact} className="text-center text-xs md:text-sm font-medium bg-muted p-2 rounded">
                        {impact}
                      </div>
                    ))}
                    <div className="flex items-center justify-center">
                      <div className="text-xs md:text-sm font-medium text-muted-foreground transform -rotate-90 whitespace-nowrap">
                        Probabilidad
                      </div>
                    </div>
                  </div>

                  {/* Matrix Body */}
                  {[5, 4, 3, 2, 1].map((probability) => (
                    <div key={probability} className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                      <div className="flex items-center justify-center text-xs md:text-sm font-medium bg-muted p-2 rounded">
                        {probability}
                      </div>
                      {[1, 2, 3, 4, 5].map((impact) => {
                        const severity = probability * impact
                        const cellRisks = getRisksForCell(probability, impact)
                        const cellColor = getMatrixCellColor(severity)

                        return (
                          <div
                            key={`${probability}-${impact}`}
                            className={`${cellColor} p-2 md:p-3 rounded-lg border-2 border-transparent hover:border-primary hover:scale-105 transition-all duration-200 cursor-pointer min-h-[60px] md:min-h-[80px] flex flex-col justify-between shadow-sm hover:shadow-md`}
                            title={`Probabilidad: ${probability}, Impacto: ${impact}, Gravedad: ${severity}`}
                          >
                            <div className="text-center">
                              <div className="text-sm md:text-lg font-bold text-white">{severity}</div>
                              {cellRisks.length > 0 && (
                                <div className="text-xs text-white/90 mt-1">
                                  {cellRisks.length} riesgo{cellRisks.length > 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                            {cellRisks.length > 0 && (
                              <div className="space-y-1">
                                {cellRisks.slice(0, 2).map((risk) => (
                                  <div
                                    key={risk.id}
                                    className="text-xs text-white/90 bg-black/20 rounded px-1 md:px-2 py-1 truncate"
                                    title={risk.name}
                                  >
                                    {risk.name}
                                  </div>
                                ))}
                                {cellRisks.length > 2 && (
                                  <div className="text-xs text-white/90 text-center">+{cellRisks.length - 2} más</div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      <div></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matrix Info */}
              <div className="text-xs md:text-sm text-muted-foreground text-center bg-muted/50 p-3 rounded-lg">
                <p>
                  Haz clic en cualquier celda para ver los detalles. Los números representan la gravedad calculada
                  (Probabilidad × Impacto).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
