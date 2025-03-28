import React, { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import FeeTokenABI from '../abis/FeeToken.json'

const FeeAdjuster = () => {
  const { account, library, active } = useWeb3React()
  const [contract, setContract] = useState(null)
  const [currentFee, setCurrentFee] = useState(0)
  const [newFee, setNewFee] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Địa chỉ contract của bạn
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' // Thay bằng địa chỉ thực tế

  // Kết nối contract khi tài khoản thay đổi
  useEffect(() => {
    if (active && account && library) {
      const signer = library.getSigner(account)
      const feeToken = new Contract(contractAddress, FeeTokenABI, signer)
      setContract(feeToken)
      
      // Lấy tỷ lệ phí hiện tại
      feeToken.feePercent()
        .then(fee => setCurrentFee(fee.toNumber()))
        .catch(err => setError('Không thể lấy thông tin phí'))
    }
  }, [account, library, active])

  const handleChangeFee = async () => {
    if (!contract || !newFee) return
    
    setLoading(true)
    setError('')
    
    try {
      const feeValue = parseInt(newFee)
      if (feeValue < 0 || feeValue > 100) {
        throw new Error('Phí phải từ 0 đến 100 (0-1%)')
      }
      
      const tx = await contract.setFeePercent(feeValue)
      await tx.wait()
      
      // Cập nhật phí mới
      const updatedFee = await contract.feePercent()
      setCurrentFee(updatedFee.toNumber())
      setNewFee('')
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fee-adjuster">
      <h2>Điều chỉnh lệ phí giao dịch</h2>
      
      {active ? (
        <>
          <div className="current-fee">
            <p>Lệ phí hiện tại: <strong>{currentFee / 100}%</strong></p>
          </div>
          
          <div className="fee-controls">
            <input
              type="number"
              min="0"
              max="100"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="Nhập phí mới (0-100 = 0-1%)"
            />
            <button 
              onClick={handleChangeFee}
              disabled={loading || !newFee}
            >
              {loading ? 'Đang xử lý...' : 'Thay đổi phí'}
            </button>
          </div>
          
          {error && <p className="error">{error}</p>}
        </>
      ) : (
        <p>Vui lòng kết nối ví để điều chỉnh phí</p>
      )}
    </div>
  )
}

export default FeeAdjuster
