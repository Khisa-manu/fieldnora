package com.fieldnora.technician.data.model

import com.google.gson.annotations.SerializedName

data class InventoryItem(
    @SerializedName("id") val id: String,
    @SerializedName("sku") val sku: String,
    @SerializedName("name") val name: String,
    @SerializedName("category") val category: String,
    @SerializedName("unitPriceKes") val unitPriceKes: Double,
    @SerializedName("vanStockQty") val vanStockQty: Int,
    @SerializedName("unit") val unit: String = "pcs",
    @SerializedName("isConsumable") val isConsumable: Boolean = true
)
